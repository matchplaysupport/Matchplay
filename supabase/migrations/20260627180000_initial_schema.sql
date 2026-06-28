create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  display_name text not null,
  username text not null unique,
  city text not null,
  state text not null,
  zip_code text not null,
  skill_level text not null check (skill_level in ('new','casual','recreational','competitive','elite')),
  handicap_source text not null check (handicap_source in ('official_unverified','match_play_estimate','none')),
  handicap_value numeric,
  preferred_radius_miles integer not null default 25,
  preferred_game_style text not null check (preferred_game_style in ('casual','competitive','both')),
  reliability_label text not null default 'New player',
  is_demo boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_privacy_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  hide_exact_age boolean not null default true,
  hide_handicap boolean not null default false,
  hide_round_history boolean not null default false,
  hide_profile_discovery boolean not null default false,
  hide_approximate_location boolean not null default false,
  hide_leaderboards boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_locations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  city text not null,
  state text not null,
  zip_code text not null,
  approximate_latitude numeric,
  approximate_longitude numeric,
  precise_latitude numeric,
  precise_longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_name text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  latitude numeric not null,
  longitude numeric not null,
  amenities text[] not null default '{}',
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tee_sets (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  color text not null,
  rating numeric not null,
  slope integer not null,
  par integer not null,
  yardage integer not null,
  created_at timestamptz not null default now()
);

create table public.course_holes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  hole_number integer not null,
  par integer not null,
  stroke_index integer not null,
  created_at timestamptz not null default now(),
  unique(course_id, hole_number)
);

create table public.tee_times (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  starts_at timestamptz not null,
  price_cents integer not null check (price_cents >= 0),
  available_spots integer not null check (available_spots between 0 and 4),
  holes integer not null check (holes in (9, 18)),
  cart_included boolean not null default false,
  walking_allowed boolean not null default true,
  cancellation_label text not null,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tee_time_id uuid not null references public.tee_times(id),
  confirmation_code text not null unique,
  players integer not null check (players between 1 and 4),
  community_spots integer not null check (community_spots between 0 and 4),
  status text not null default 'simulated_confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  tee_set_id uuid references public.tee_sets(id),
  format text not null check (format in ('stroke_play','match_play','stableford','practice')),
  holes integer not null check (holes in (9, 18)),
  verification_state text not null default 'draft',
  gross_score integer,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.round_holes (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  hole_number integer not null,
  gross_score integer not null,
  putts integer not null default 0,
  fairway text not null,
  green_in_regulation boolean not null default false,
  penalty_strokes integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique(round_id, hole_number)
);

create table public.open_games (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  starts_at timestamptz not null,
  available_spots integer not null check (available_spots between 1 and 4),
  approval_required boolean not null default true,
  visibility text not null check (visibility in ('public','friends','invite_only')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.open_game_members (
  open_game_id uuid references public.open_games(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  status text not null check (status in ('accepted','waitlisted','removed','left')),
  created_at timestamptz not null default now(),
  primary key (open_game_id, profile_id)
);

create table public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct','open_game','match')),
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subscription_entitlements (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  entitlement text not null check (entitlement in ('free','pro')),
  source text not null default 'mock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  scope text not null,
  period text not null,
  category text not null,
  points integer not null default 0,
  rank integer not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_privacy_settings enable row level security;
alter table public.user_locations enable row level security;
alter table public.bookings enable row level security;
alter table public.rounds enable row level security;
alter table public.round_holes enable row level security;
alter table public.open_games enable row level security;
alter table public.open_game_members enable row level security;
alter table public.blocks enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.subscription_entitlements enable row level security;

create policy "profiles own rows" on public.profiles
  for all using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy "profiles public demo read" on public.profiles
  for select using (is_demo = true);

create policy "privacy own rows" on public.user_privacy_settings
  for all using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "locations own precise rows" on public.user_locations
  for all using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "bookings owner rows" on public.bookings
  for all using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "rounds owner rows" on public.rounds
  for all using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "messages conversation members read" on public.messages
  for select using (
    exists (
      select 1 from public.conversation_members cm
      join public.profiles p on p.id = cm.profile_id
      where cm.conversation_id = messages.conversation_id and p.auth_user_id = auth.uid()
    )
  );

create policy "messages conversation members insert" on public.messages
  for insert with check (
    sender_id in (select id from public.profiles where auth_user_id = auth.uid())
    and exists (
      select 1 from public.conversation_members cm
      join public.profiles p on p.id = cm.profile_id
      where cm.conversation_id = messages.conversation_id and p.auth_user_id = auth.uid()
    )
  );

