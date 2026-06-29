-- Extend open_games with the descriptive fields the app shows, and add an
-- atomic create RPC that also seats the creator as an accepted member.
alter table public.open_games
  add column if not exists description text,
  add column if not exists holes integer check (holes is null or holes in (9, 18)),
  add column if not exists estimated_price_cents integer,
  add column if not exists cart_included boolean,
  add column if not exists handicap_range_min numeric,
  add column if not exists handicap_range_max numeric;

-- Create a public open game and seat its creator, in one transaction.
-- Resolves the creator from the JWT (auth.uid()) rather than trusting a param.
create or replace function public.create_open_game(
  p_course_id uuid,
  p_starts_at timestamptz,
  p_available_spots integer,
  p_approval_required boolean,
  p_visibility text,
  p_description text,
  p_holes integer,
  p_estimated_price_cents integer,
  p_cart_included boolean,
  p_handicap_range_min numeric,
  p_handicap_range_max numeric
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid;
  v_id uuid;
begin
  select id into v_profile from public.profiles where auth_user_id = auth.uid();
  if v_profile is null then
    raise exception 'No profile for current user';
  end if;

  insert into public.open_games (
    creator_id, course_id, starts_at, available_spots, approval_required, visibility,
    description, holes, estimated_price_cents, cart_included, handicap_range_min, handicap_range_max
  ) values (
    v_profile, p_course_id, p_starts_at, p_available_spots,
    coalesce(p_approval_required, true), coalesce(p_visibility, 'public'),
    p_description, p_holes, p_estimated_price_cents, p_cart_included,
    p_handicap_range_min, p_handicap_range_max
  )
  returning id into v_id;

  insert into public.open_game_members (open_game_id, profile_id, status)
  values (v_id, v_profile, 'accepted');

  return v_id;
end;
$$;

revoke all on function public.create_open_game(uuid, timestamptz, integer, boolean, text, text, integer, integer, boolean, numeric, numeric) from public;
grant execute on function public.create_open_game(uuid, timestamptz, integer, boolean, text, text, integer, integer, boolean, numeric, numeric) to authenticated;
