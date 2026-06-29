-- Atomic open-game join with server-side capacity enforcement.
-- Locks the game row so concurrent joins can't overfill it. Returns the
-- resulting membership state: 'joined' | 'waitlisted' | 'already_member' | 'not_found'.
create or replace function public.join_open_game(
  p_open_game_id uuid,
  p_profile_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game public.open_games;
  v_existing text;
  v_accepted_count integer;
  v_status text;
begin
  -- Serialize concurrent joins on this game.
  select * into v_game
  from public.open_games
  where id = p_open_game_id
  for update;

  if not found then
    return 'not_found';
  end if;

  -- Already participating?
  select status into v_existing
  from public.open_game_members
  where open_game_id = p_open_game_id
    and profile_id = p_profile_id;

  if v_existing in ('accepted', 'waitlisted') then
    return 'already_member';
  end if;

  select count(*) into v_accepted_count
  from public.open_game_members
  where open_game_id = p_open_game_id
    and status = 'accepted';

  -- Instant join only when there's room and the host doesn't gate on approval.
  if v_accepted_count < v_game.available_spots and not v_game.approval_required then
    v_status := 'accepted';
  else
    v_status := 'waitlisted';
  end if;

  insert into public.open_game_members (open_game_id, profile_id, status)
  values (p_open_game_id, p_profile_id, v_status)
  on conflict (open_game_id, profile_id)
  do update set status = excluded.status, created_at = now();

  return case when v_status = 'accepted' then 'joined' else 'waitlisted' end;
end;
$$;

revoke all on function public.join_open_game(uuid, uuid) from public;
grant execute on function public.join_open_game(uuid, uuid) to authenticated, service_role;
