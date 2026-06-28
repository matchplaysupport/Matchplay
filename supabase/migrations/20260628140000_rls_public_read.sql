-- Courses and tee times are publicly readable (no auth required)
alter table public.courses enable row level security;
alter table public.tee_sets enable row level security;
alter table public.course_holes enable row level security;
alter table public.tee_times enable row level security;
alter table public.leaderboard_entries enable row level security;

create policy "courses public read" on public.courses for select using (true);
create policy "tee_sets public read" on public.tee_sets for select using (true);
create policy "course_holes public read" on public.course_holes for select using (true);
create policy "tee_times public read" on public.tee_times for select using (true);
create policy "leaderboard_entries public read" on public.leaderboard_entries for select using (true);

-- Authenticated users can insert bookings; the check ensures they own the profile row
-- (policy already exists in initial schema but status needs expanding)
-- Allow real confirmed status
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('requested', 'confirmed', 'fulfilled', 'cancelled', 'simulated_confirmed'));

-- Tee times: available_spots can be decremented by the booking flow via a function
-- (will add that when building the booking/payment step)
