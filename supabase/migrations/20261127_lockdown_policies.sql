-- Part 2 of the lockdown: turn on Row Level Security everywhere.
-- Run this at the same moment the new app goes live: the old app writes without a sign-in token,
-- so after this runs, the old app can still read prices but can no longer save anything.
-- Reads stay public; writes need a signed-in manager or developer (see app_role()).

-- old wide-open policies from the first setup (they would let everyone write once RLS is on)
drop policy if exists "Allow all" on public.items;
drop policy if exists "public read write" on public.items;
drop policy if exists "Allow all" on public.app_settings;
drop policy if exists "public read write" on public.app_settings;
drop policy if exists "Allow all" on public.schedule_shifts;
drop policy if exists "public read write" on public.schedule_shifts;
drop policy if exists "Allow all" on public.known_bugs;
drop policy if exists "public read write" on public.known_bugs;
drop policy if exists "Allow all" on public.bug_reports;
drop policy if exists "public read write" on public.bug_reports;
drop policy if exists "Allow all" on public.suggestions;
drop policy if exists "public read write" on public.suggestions;
drop policy if exists "Allow all" on public.update_logs;
drop policy if exists "public read write" on public.update_logs;
drop policy if exists "Allow all" on public.audit_log;
drop policy if exists "public read write" on public.audit_log;

alter table public.items enable row level security;
alter table public.app_settings enable row level security;
alter table public.schedule_shifts enable row level security;
alter table public.known_bugs enable row level security;
alter table public.bug_reports enable row level security;
alter table public.suggestions enable row level security;
alter table public.update_logs enable row level security;
alter table public.audit_log enable row level security;   -- unused old table: no access at all

-- items: anyone can read; managers and developers can change
create policy items_read on public.items for select using (true);
create policy items_write on public.items for insert with check (public.app_role() is not null);
create policy items_update on public.items for update using (public.app_role() is not null) with check (public.app_role() is not null);
create policy items_delete on public.items for delete using (public.app_role() is not null);

-- settings: anyone can read; the developer changes them, managers only the staff list
create policy settings_read on public.app_settings for select using (true);
create policy settings_insert on public.app_settings for insert
  with check (public.app_role() = 'dev' or (public.app_role() = 'manager' and key = 'staff_list'));
create policy settings_update on public.app_settings for update
  using (public.app_role() = 'dev' or (public.app_role() = 'manager' and key = 'staff_list'))
  with check (public.app_role() = 'dev' or (public.app_role() = 'manager' and key = 'staff_list'));
create policy settings_delete on public.app_settings for delete using (public.app_role() = 'dev');

-- schedule: anyone can read; managers and developers change shifts
create policy shifts_read on public.schedule_shifts for select using (true);
create policy shifts_insert on public.schedule_shifts for insert with check (public.app_role() is not null);
create policy shifts_update on public.schedule_shifts for update using (public.app_role() is not null) with check (public.app_role() is not null);
create policy shifts_delete on public.schedule_shifts for delete using (public.app_role() is not null);

-- known bugs and the update log: anyone can read; the developer writes
create policy known_bugs_read on public.known_bugs for select using (true);
create policy known_bugs_write on public.known_bugs for insert with check (public.app_role() = 'dev');
create policy known_bugs_update on public.known_bugs for update using (public.app_role() = 'dev') with check (public.app_role() = 'dev');
create policy known_bugs_delete on public.known_bugs for delete using (public.app_role() = 'dev');
create policy update_logs_read on public.update_logs for select using (true);
create policy update_logs_write on public.update_logs for insert with check (public.app_role() = 'dev');
create policy update_logs_update on public.update_logs for update using (public.app_role() = 'dev') with check (public.app_role() = 'dev');
create policy update_logs_delete on public.update_logs for delete using (public.app_role() = 'dev');

-- bug reports: managers file them, signed-in people read them, the developer clears them
create policy bug_reports_read on public.bug_reports for select using (public.app_role() is not null);
create policy bug_reports_write on public.bug_reports for insert with check (public.app_role() is not null);
create policy bug_reports_delete on public.bug_reports for delete using (public.app_role() = 'dev');

-- suggestions: anyone can read and post (starting at 0 votes); voting goes through app_vote(); the developer deletes
create policy suggestions_read on public.suggestions for select using (true);
create policy suggestions_post on public.suggestions for insert
  with check (coalesce(votes, 0) = 0 and char_length(coalesce(title, '')) between 1 and 200 and char_length(coalesce(description, '')) <= 2000);
create policy suggestions_delete on public.suggestions for delete using (public.app_role() = 'dev');

-- edit history: signed-in people read it; only the trigger and app_undo_edit() write it
create policy item_edits_read on public.item_edits for select using (public.app_role() is not null);
