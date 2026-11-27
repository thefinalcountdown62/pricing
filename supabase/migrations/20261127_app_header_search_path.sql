-- Pin app_header's search_path (Supabase security advisor)
alter function public.app_header(text) set search_path = public;
