-- Part 1 of the lockdown: server-side sign-in and a shared edit history.
-- Safe to run while the old site is live: it only adds tables and functions.

-- PINs live here, out of reach of the public key (RLS on, no policies).
create table if not exists public.app_secrets (name text primary key, value text not null);
alter table public.app_secrets enable row level security;
insert into public.app_secrets (name, value) values ('manager_pin', '3018'), ('dev_pin', '130654')
  on conflict (name) do nothing;

-- One row per signed-in device; the app sends the token in an "x-app-session" header.
create table if not exists public.app_sessions (
  token text primary key,
  role text not null check (role in ('manager', 'dev')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
alter table public.app_sessions enable row level security;

-- Failed PIN attempts, for rate limiting.
create table if not exists public.app_login_attempts (
  id bigserial primary key, ip text not null, ok boolean not null, at timestamptz not null default now()
);
alter table public.app_login_attempts enable row level security;
create index if not exists app_login_attempts_ip_at on public.app_login_attempts (ip, at);

-- Every add / edit / delete of an item, written by a trigger so nothing can skip it.
create table if not exists public.item_edits (
  id bigserial primary key,
  item_id bigint,
  action text not null check (action in ('added', 'edited', 'deleted')),
  role text,
  before jsonb,
  after jsonb,
  undone boolean not null default false,
  undone_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists item_edits_created on public.item_edits (created_at desc);
create index if not exists item_edits_item on public.item_edits (item_id, created_at desc);
alter table public.item_edits enable row level security;

-- ── who is calling ───────────────────────────────────────────────────────────
create or replace function public.app_header(name text) returns text
language sql stable as $$
  select nullif(coalesce(current_setting('request.headers', true), '{}')::json ->> name, '')
$$;

-- 'dev', 'manager' or null. A manager session stops counting while manager access is switched off.
create or replace function public.app_role() returns text
language sql stable security definer set search_path = public as $$
  select s.role from app_sessions s
  where s.token = app_header('x-app-session') and s.expires_at > now()
    and not (s.role = 'manager' and coalesce((select value from app_settings where key = 'manager_disabled'), 'false') = 'true')
$$;

create or replace function public.app_whoami() returns text
language sql stable security definer set search_path = public as $$ select app_role() $$;

-- ── sign in / out ────────────────────────────────────────────────────────────
create or replace function public.app_sign_in(pin text) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  v_ip text := coalesce(nullif(split_part(app_header('x-forwarded-for'), ',', 1), ''), 'unknown');
  r text; t text;
begin
  -- 8 wrong PINs from one address in 10 minutes locks that address for the rest of the window
  if (select count(*) from app_login_attempts where ip = v_ip and not ok and at > now() - interval '10 minutes') >= 8 then
    return json_build_object('error', 'locked');
  end if;
  if pin = (select value from app_secrets where name = 'dev_pin') then r := 'dev';
  elsif pin = (select value from app_secrets where name = 'manager_pin') then
    if coalesce((select value from app_settings where key = 'manager_disabled'), 'false') = 'true' then
      return json_build_object('error', 'disabled');
    end if;
    r := 'manager';
  end if;
  insert into app_login_attempts (ip, ok) values (v_ip, r is not null);
  delete from app_login_attempts where at < now() - interval '1 day';
  if r is null then return json_build_object('error', 'wrong'); end if;
  t := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into app_sessions (token, role, expires_at) values (t, r, now() + interval '24 hours');
  delete from app_sessions where expires_at < now();
  return json_build_object('token', t, 'role', r);
end $$;

create or replace function public.app_sign_out() returns void
language sql volatile security definer set search_path = public as $$
  delete from app_sessions where token = app_header('x-app-session')
$$;

-- ── manager PIN (developer only) ─────────────────────────────────────────────
create or replace function public.app_manager_pin() returns text
language sql stable security definer set search_path = public as $$
  select case when app_role() = 'dev' then (select value from app_secrets where name = 'manager_pin') end
$$;

create or replace function public.app_set_manager_pin(new_pin text) returns json
language plpgsql volatile security definer set search_path = public as $$
begin
  if app_role() is distinct from 'dev' then return json_build_object('error', 'not allowed'); end if;
  if new_pin !~ '^\d{4,6}$' then return json_build_object('error', 'The PIN needs 4 to 6 digits.'); end if;
  if new_pin = (select value from app_secrets where name = 'dev_pin') then return json_build_object('error', 'That PIN is taken. Pick a different one.'); end if;
  update app_secrets set value = new_pin where name = 'manager_pin';
  return json_build_object('ok', true);
end $$;

-- ── edit history ─────────────────────────────────────────────────────────────
create or replace function public.log_item_edit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if current_setting('app.skip_log', true) = 'on' then return coalesce(new, old); end if;
  if tg_op = 'UPDATE' and to_jsonb(old) = to_jsonb(new) then return new; end if;
  insert into item_edits (item_id, action, role, before, after)
  values (coalesce(new.id, old.id),
          case tg_op when 'INSERT' then 'added' when 'UPDATE' then 'edited' else 'deleted' end,
          app_role(),
          case when tg_op = 'INSERT' then null else to_jsonb(old) end,
          case when tg_op = 'DELETE' then null else to_jsonb(new) end);
  return coalesce(new, old);
end $$;
drop trigger if exists items_log_edit on public.items;
create trigger items_log_edit after insert or update or delete on public.items
  for each row execute function public.log_item_edit();

-- Put an edited item back the way it was, and mark that edit undone (the revert itself isn't logged).
create or replace function public.app_undo_edit(edit_id bigint) returns json
language plpgsql volatile security definer set search_path = public as $$
declare e item_edits; b items; res items;
begin
  if app_role() is null then return json_build_object('error', 'not allowed'); end if;
  select * into e from item_edits where id = edit_id;
  if e.id is null or e.action <> 'edited' or e.undone then return json_build_object('error', 'nothing to undo'); end if;
  b := jsonb_populate_record(null::items, e.before);
  perform set_config('app.skip_log', 'on', true);
  update items set name = b.name, category = b.category, subcategory = b.subcategory, price = b.price, location = b.location,
    notes = b.notes, inventory = b.inventory, out_of_stock = b.out_of_stock, map_zone = b.map_zone, expiry_date = b.expiry_date,
    pack_size = b.pack_size, container_type = b.container_type, deposit = b.deposit, wine_type = b.wine_type,
    gillies_recommendation = b.gillies_recommendation, day_prices = b.day_prices, taxable = b.taxable
  where id = e.item_id returning * into res;
  perform set_config('app.skip_log', 'off', true);
  if res.id is null then return json_build_object('error', 'item no longer exists'); end if;
  update item_edits set undone = true, undone_at = now() where id = edit_id;
  return json_build_object('item', to_jsonb(res));
end $$;

-- Votes go through here so the public can't edit suggestions directly.
create or replace function public.app_vote(suggestion_id bigint) returns void
language sql volatile security definer set search_path = public as $$
  update suggestions set votes = coalesce(votes, 0) + 1 where id = suggestion_id
$$;

revoke all on function public.log_item_edit() from public, anon, authenticated;
