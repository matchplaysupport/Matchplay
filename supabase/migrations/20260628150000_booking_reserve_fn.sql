-- Atomically decrements available_spots and returns the updated row.
-- Returns null if spots are insufficient (caller treats as conflict).
create or replace function public.reserve_tee_time_spots(
  p_tee_time_id uuid,
  p_players integer
)
returns setof public.tee_times
language sql
security definer
as $$
  update public.tee_times
  set available_spots = available_spots - p_players,
      updated_at = now()
  where id = p_tee_time_id
    and available_spots >= p_players
  returning *;
$$;
