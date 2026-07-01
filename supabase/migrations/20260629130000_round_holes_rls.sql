-- Backfill missing RLS policies. These tables had RLS enabled but no policy,
-- which blocks ALL reads/writes for normal users.
--
-- round_holes: blocked all reads/writes — rounds came back with empty holes, so
-- stats/handicap saw zero eligible rounds. Mirror "rounds owner rows" via parent.

drop policy if exists "round_holes owner rows" on public.round_holes;
create policy "round_holes owner rows" on public.round_holes
  for all
  using (
    round_id in (
      select r.id
      from public.rounds r
      join public.profiles p on p.id = r.profile_id
      where p.auth_user_id = auth.uid()
    )
  )
  with check (
    round_id in (
      select r.id
      from public.rounds r
      join public.profiles p on p.id = r.profile_id
      where p.auth_user_id = auth.uid()
    )
  );

-- blocks: a golfer manages their own block list (owner = blocker).
drop policy if exists "blocks owner rows" on public.blocks;
create policy "blocks owner rows" on public.blocks
  for all
  using (blocker_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (blocker_id in (select id from public.profiles where auth_user_id = auth.uid()));

-- NOTE: conversations + conversation_members still have RLS enabled with no
-- policy (messaging is blocked in live mode). Left intentionally — they need a
-- proper membership-based read/insert model designed alongside the messaging
-- feature, not a guessed policy here.
