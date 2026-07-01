-- Seed demo tee times for the two existing courses.
-- Run in the Supabase SQL Editor (service role). Safe to re-run: it clears
-- prior demo rows first. Generates the next 7 days × 5 daily slots per course.

delete from public.tee_times where is_demo = true;

insert into public.tee_times
  (course_id, starts_at, price_cents, available_spots, holes, cart_included, walking_allowed, cancellation_label, is_demo)
select
  c.id,
  ((current_date + d)::timestamp + slot.t)::timestamptz,
  slot.price,
  slot.spots,
  slot.holes,
  slot.cart,
  slot.walk,
  'Free cancellation up to 24h before',
  true
from (values
  ('42b829c1-24d8-464a-bde1-4efa09b78cf9'::uuid),   -- Harpeth Hills Golf Course (Nashville)
  ('c1000000-0000-4000-8000-0000000000c1'::uuid)    -- Clubhouse Test GC (Knoxville)
) as c(id)
cross join generate_series(1, 7) as d
cross join (values
  (interval '7 hours',  4500, 4, 18, true,  true),
  (interval '9 hours',  5500, 3, 18, true,  true),
  (interval '11 hours', 6500, 2, 18, false, true),
  (interval '14 hours', 4000, 4, 9,  false, true),
  (interval '16 hours', 3500, 2, 9,  true,  true)
) as slot(t, price, spots, holes, cart, walk);

-- sanity check
select count(*) as seeded_tee_times from public.tee_times where is_demo = true;
