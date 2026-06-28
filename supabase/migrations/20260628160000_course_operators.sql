-- Course operators: links Supabase auth users to courses they manage
create table public.course_operators (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  course_id uuid not null references public.courses(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

alter table public.course_operators enable row level security;

create policy "operators own rows" on public.course_operators
  for all using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- Operators can manage tee times for their course
create policy "tee_times operator write" on public.tee_times
  for all using (
    course_id in (
      select course_id from public.course_operators where auth_user_id = auth.uid()
    )
  )
  with check (
    course_id in (
      select course_id from public.course_operators where auth_user_id = auth.uid()
    )
  );

-- Operators can view bookings for their course's tee times
create policy "bookings operator read" on public.bookings
  for select using (
    tee_time_id in (
      select tt.id from public.tee_times tt
      join public.course_operators co on co.course_id = tt.course_id
      where co.auth_user_id = auth.uid()
    )
  );

-- Operators can update their course details
create policy "courses operator update" on public.courses
  for update using (
    id in (select course_id from public.course_operators where auth_user_id = auth.uid())
  )
  with check (
    id in (select course_id from public.course_operators where auth_user_id = auth.uid())
  );

-- Operators can insert a new course (when registering)
create policy "courses operator insert" on public.courses
  for insert with check (auth.uid() is not null);

-- Helper function: get the course_id for the currently signed-in operator
create or replace function public.my_course_id()
returns uuid language sql security definer stable as $$
  select course_id from public.course_operators where auth_user_id = auth.uid() limit 1;
$$;
