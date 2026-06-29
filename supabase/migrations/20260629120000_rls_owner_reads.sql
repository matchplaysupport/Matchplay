-- RLS read/update policies for tables that had RLS enabled but NO policies,
-- which silently denies all access. Without these, several shipped features
-- read empty data in live mode:
--   * notifications        — in-app notification list/mark-read
--   * subscription_entitlements — golfer entitlement (paywall unlock / Pro gating)
--   * open_games / members — live open-game discovery + join reachability
-- Idempotent (drop-if-exists) so it can't collide with policies added elsewhere.

-- ── notifications: a golfer reads & marks-read their own ─────────────────────
drop policy if exists "notifications owner read" on public.notifications;
create policy "notifications owner read" on public.notifications
  for select using (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

drop policy if exists "notifications owner update" on public.notifications;
create policy "notifications owner update" on public.notifications
  for update using (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  ) with check (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- ── subscription_entitlements: a golfer reads their own entitlement ──────────
-- (Writes happen via the Stripe webhook using the service role, which bypasses RLS.)
drop policy if exists "entitlements owner read" on public.subscription_entitlements;
create policy "entitlements owner read" on public.subscription_entitlements
  for select using (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- ── open_games: public games are discoverable ───────────────────────────────
drop policy if exists "open_games public read" on public.open_games;
create policy "open_games public read" on public.open_games
  for select using (visibility = 'public');

-- ── open_game_members: roster of public games is readable (spots-left, etc.) ─
drop policy if exists "open_game_members public read" on public.open_game_members;
create policy "open_game_members public read" on public.open_game_members
  for select using (
    open_game_id in (select id from public.open_games where visibility = 'public')
  );
