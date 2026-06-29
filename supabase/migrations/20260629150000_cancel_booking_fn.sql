-- Cancel a booking and restore the tee-time spot, atomically.
--
-- Golfers can update their own bookings (RLS) but cannot write tee_times
-- (operator-only), so releasing the reserved spot needs a SECURITY DEFINER
-- function. This verifies the caller owns the booking (auth.uid() is preserved
-- under SECURITY DEFINER), is idempotent, and caps available_spots at the
-- table's max of 4.

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile uuid;
  v_booking public.bookings%rowtype;
begin
  select id into v_profile from public.profiles where auth_user_id = auth.uid();
  if v_profile is null then
    raise exception 'No profile for current user';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id and profile_id = v_profile
  for update;
  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.status = 'cancelled' then
    return; -- idempotent
  end if;

  update public.bookings
  set status = 'cancelled', updated_at = now()
  where id = p_booking_id;

  update public.tee_times
  set available_spots = least(available_spots + v_booking.players, 4),
      updated_at = now()
  where id = v_booking.tee_time_id;
end;
$$;
