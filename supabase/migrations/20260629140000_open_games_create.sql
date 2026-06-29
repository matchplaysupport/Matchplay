-- Let golfers create open games from the app, and carry the fields the
-- create-game form collects (the base table only had scheduling columns).

alter table public.open_games
  add column if not exists description text,
  add column if not exists holes integer,
  add column if not exists estimated_price_cents integer,
  add column if not exists cart_included boolean not null default false;

alter table public.open_games
  drop constraint if exists open_games_holes_check;
alter table public.open_games
  add constraint open_games_holes_check check (holes is null or holes in (9, 18));

alter table public.open_games
  drop constraint if exists open_games_price_check;
alter table public.open_games
  add constraint open_games_price_check check (estimated_price_cents is null or estimated_price_cents >= 0);

-- A signed-in golfer can create a game they host (creator must be their profile).
drop policy if exists "open_games owner insert" on public.open_games;
create policy "open_games owner insert" on public.open_games
  for insert to authenticated
  with check (
    creator_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- A host can update/cancel their own game.
drop policy if exists "open_games owner update" on public.open_games;
create policy "open_games owner update" on public.open_games
  for update to authenticated
  using (creator_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (creator_id in (select id from public.profiles where auth_user_id = auth.uid()));

drop policy if exists "open_games owner delete" on public.open_games;
create policy "open_games owner delete" on public.open_games
  for delete to authenticated
  using (creator_id in (select id from public.profiles where auth_user_id = auth.uid()));
