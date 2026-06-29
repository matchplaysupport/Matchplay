-- Self-serve website signups (replaces "request demo access" for real flows).
--
-- Golfers: just create a public.profiles row at signup — the existing
-- "profiles own rows" policy (initial schema) already covers read/write, so no
-- new policy is needed here.
--
-- Courses: APPLY-then-APPROVE. At signup an operator creates a Supabase auth
-- account plus a course_applications row (status 'pending'); they can sign into
-- /admin but see a "pending review" state. An admin (profiles.is_admin) approves,
-- which provisions the courses + course_operators rows and unlocks the portal.
--
-- Re-runnable: table create is guarded, policies use drop-if-exists.

-- ── course_applications ───────────────────────────────────────────────────────
create table if not exists public.course_applications (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,        -- operator's account, created at signup
  contact_name text not null,
  email text not null,
  course_name text not null,
  facility_name text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  course_id uuid references public.courses(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.course_applications enable row level security;

-- Applicant reads their own application (powers the "pending review" dashboard).
drop policy if exists "applications own read" on public.course_applications;
create policy "applications own read" on public.course_applications
  for select using (auth.uid() = auth_user_id);

-- Applicant files their own application; can only ever create it as 'pending'.
-- Status transitions happen exclusively through the SECURITY DEFINER RPCs below.
drop policy if exists "applications own insert" on public.course_applications;
create policy "applications own insert" on public.course_applications
  for insert with check (auth.uid() = auth_user_id and status = 'pending');

-- Admins can review every application.
drop policy if exists "applications admin read" on public.course_applications;
create policy "applications admin read" on public.course_applications
  for select using (
    exists (
      select 1 from public.profiles p
      where p.auth_user_id = auth.uid() and p.is_admin
    )
  );

-- ── Approval RPC: provisions course + operator, unlocks /admin ────────────────
create or replace function public.approve_course_application(p_application_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_admin boolean;
  v_app public.course_applications%rowtype;
  v_course_id uuid;
begin
  select exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.is_admin
  ) into v_is_admin;
  if not v_is_admin then
    raise exception 'not authorized';
  end if;

  select * into v_app from public.course_applications
  where id = p_application_id
  for update;
  if not found then
    raise exception 'application not found';
  end if;
  if v_app.status = 'approved' then
    return v_app.course_id;  -- idempotent
  end if;

  -- Lat/long are placeholders; the operator sets real coordinates in Settings.
  insert into public.courses (name, facility_name, city, state, zip_code, latitude, longitude, is_demo)
  values (v_app.course_name, v_app.facility_name, v_app.city, v_app.state, v_app.zip_code, 0, 0, false)
  returning id into v_course_id;

  insert into public.course_operators (auth_user_id, course_id, role)
  values (v_app.auth_user_id, v_course_id, 'owner');

  update public.course_applications
  set status = 'approved',
      course_id = v_course_id,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_application_id;

  return v_course_id;
end;
$$;

-- ── Rejection RPC ─────────────────────────────────────────────────────────────
create or replace function public.reject_course_application(p_application_id uuid, p_notes text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_admin boolean;
begin
  select exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.is_admin
  ) into v_is_admin;
  if not v_is_admin then
    raise exception 'not authorized';
  end if;

  update public.course_applications
  set status = 'rejected',
      review_notes = p_notes,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_application_id
    and status <> 'approved';
end;
$$;

revoke all on function public.approve_course_application(uuid) from public;
revoke all on function public.reject_course_application(uuid, text) from public;
grant execute on function public.approve_course_application(uuid) to authenticated, service_role;
grant execute on function public.reject_course_application(uuid, text) to authenticated, service_role;
