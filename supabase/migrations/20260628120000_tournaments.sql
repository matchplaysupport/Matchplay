create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references public.courses(id) on delete set null,
  course_name text,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  format text not null check (format in ('stroke_play', 'match_play', 'stableford', 'scramble')),
  holes integer not null check (holes in (9, 18)),
  max_players integer not null default 16,
  buy_in_cents integer not null default 0,
  prize_distribution text not null default 'no_prize' check (prize_distribution in ('winner_takes_all', 'top3_split', 'no_prize')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tournament_players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  payment_status text not null default 'registered' check (payment_status in ('registered', 'paid', 'withdrawn')),
  final_position integer,
  payout_cents integer,
  joined_at timestamptz not null default now(),
  unique (tournament_id, player_id)
);

-- RLS
alter table public.tournaments enable row level security;
alter table public.tournament_players enable row level security;

-- Anyone can view open/in-progress tournaments
create policy "tournaments_select" on public.tournaments for select using (true);

-- Only creator can update
create policy "tournaments_update" on public.tournaments for update using (auth.uid() = (select auth_user_id from public.profiles where id = creator_id));

-- Authenticated users can create
create policy "tournaments_insert" on public.tournaments for insert with check (auth.uid() is not null);

-- Players visible to all
create policy "tournament_players_select" on public.tournament_players for select using (true);

-- Player can join/withdraw themselves; creator can mark paid
create policy "tournament_players_insert" on public.tournament_players for insert with check (auth.uid() is not null);
create policy "tournament_players_update" on public.tournament_players for update using (auth.uid() is not null);
