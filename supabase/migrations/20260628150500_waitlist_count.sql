-- Expose only an aggregate count of the waitlist to anonymous clients.
-- Row data stays private (readable by service role only); this function
-- returns just the total so the landing page can show social proof.
create or replace function public.waitlist_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.waitlist;
$$;

revoke all on function public.waitlist_count() from public;
grant execute on function public.waitlist_count() to anon;
grant execute on function public.waitlist_count() to authenticated;
