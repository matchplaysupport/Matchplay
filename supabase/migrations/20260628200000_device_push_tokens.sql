-- Expo push tokens per device, so the server can deliver last-minute slot
-- alerts and social notifications to a golfer's phones.
create table if not exists public.device_push_tokens (
  token text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists device_push_tokens_profile_idx
  on public.device_push_tokens(profile_id);

alter table public.device_push_tokens enable row level security;

-- A golfer only ever sees / manages their own device tokens.
create policy "own push tokens select" on public.device_push_tokens
  for select using (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

create policy "own push tokens insert" on public.device_push_tokens
  for insert with check (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

create policy "own push tokens update" on public.device_push_tokens
  for update using (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  ) with check (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

create policy "own push tokens delete" on public.device_push_tokens
  for delete using (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );
