-- Live-scoring events (Phase A): a field of participants playing one round, with
-- a designated group scorer entering scores that stream live to a public web
-- scoreboard via Supabase Realtime. Participants need NOT have app accounts —
-- they're just names in the field. Authorization to write scores is membership-
-- based (event_scorers), which is also how "event-scoped free" works: the
-- scoring path never touches the paid entitlement gate.

-- ── Tables ───────────────────────────────────────────────────────────────────

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  event_type text not null default 'junior'
    check (event_type in ('junior', 'college', 'scramble', 'open', 'course')),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  tee_set_id uuid references public.tee_sets(id) on delete set null,
  holes integer not null default 18 check (holes in (9, 18)),
  scoring_mode text not null default 'group_scorer'
    check (scoring_mode in ('group_scorer', 'self')),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  public_scoreboard boolean not null default true,
  free_for_participants boolean not null default true,
  starts_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  -- Linked only if the participant happens to have an account; juniors usually won't.
  profile_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  group_no integer,
  starting_hole integer not null default 1,
  tee_set_id uuid references public.tee_sets(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'withdrawn', 'disqualified')),
  created_at timestamptz not null default now()
);

create table public.event_scorers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  -- Scorers must be app users (they sign in to enter scores).
  profile_id uuid not null references public.profiles(id) on delete cascade,
  -- null group_no = may score the whole event (e.g. the organizer).
  group_no integer,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id, group_no)
);

-- Hot table: one row per participant per hole, upserted on the unique key.
create table public.live_scores (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid not null references public.event_participants(id) on delete cascade,
  hole_number integer not null,
  strokes integer not null check (strokes between 1 and 20),
  entered_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, hole_number)
);

-- Append-only trail for integrity / dispute resolution.
create table public.score_audit (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid not null references public.event_participants(id) on delete cascade,
  hole_number integer not null,
  old_strokes integer,
  new_strokes integer not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index events_slug_idx on public.events(slug);
create index event_participants_event_idx on public.event_participants(event_id, group_no);
create index event_scorers_event_profile_idx on public.event_scorers(event_id, profile_id);
create index live_scores_event_idx on public.live_scores(event_id);
create index score_audit_event_idx on public.score_audit(event_id);

-- ── Authorization helpers (security definer so policies don't recurse into RLS) ─

create or replace function public.is_event_organizer(p_event_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.events e
    join public.profiles pr on pr.id = e.organizer_id
    where e.id = p_event_id
      and pr.auth_user_id = auth.uid()
  );
$$;

create or replace function public.can_score_participant(p_participant_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.event_participants ep
    join public.event_scorers es on es.event_id = ep.event_id
    join public.profiles pr on pr.id = es.profile_id
    where ep.id = p_participant_id
      and pr.auth_user_id = auth.uid()
      and (es.group_no is null or es.group_no = ep.group_no)
  );
$$;

revoke all on function public.is_event_organizer(uuid) from public;
revoke all on function public.can_score_participant(uuid) from public;
grant execute on function public.is_event_organizer(uuid) to authenticated, service_role;
grant execute on function public.can_score_participant(uuid) to authenticated, service_role;

-- ── Triggers: audit trail + updated_at touch ──────────────────────────────────

create or replace function public.log_score_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.score_audit (event_id, participant_id, hole_number, old_strokes, new_strokes, changed_by)
  values (
    new.event_id,
    new.participant_id,
    new.hole_number,
    case when tg_op = 'UPDATE' then old.strokes else null end,
    new.strokes,
    new.entered_by
  );
  return new;
end;
$$;

create trigger trg_log_score_change
  after insert or update on public.live_scores
  for each row execute function public.log_score_change();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_live_scores_updated_at
  before update on public.live_scores
  for each row execute function public.touch_updated_at();

create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.event_scorers enable row level security;
alter table public.live_scores enable row level security;
alter table public.score_audit enable row level security;

-- Public read: the web scoreboard + in-app field view read with the anon key.
create policy "events public read" on public.events for select using (true);
create policy "event_participants public read" on public.event_participants for select using (true);
create policy "event_scorers public read" on public.event_scorers for select using (true);
create policy "live_scores public read" on public.live_scores for select using (true);
create policy "score_audit public read" on public.score_audit for select using (true);

-- Organizers manage their events and field.
create policy "events insert" on public.events for insert
  with check (organizer_id in (select id from public.profiles where auth_user_id = auth.uid()));
create policy "events update" on public.events for update
  using (organizer_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (organizer_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "event_participants write" on public.event_participants for all
  using (public.is_event_organizer(event_id))
  with check (public.is_event_organizer(event_id));

create policy "event_scorers write" on public.event_scorers for all
  using (public.is_event_organizer(event_id))
  with check (public.is_event_organizer(event_id));

-- Only an assigned scorer (or whole-event scorer) may write a participant's scores.
create policy "live_scores insert" on public.live_scores for insert
  with check (public.can_score_participant(participant_id));
create policy "live_scores update" on public.live_scores for update
  using (public.can_score_participant(participant_id))
  with check (public.can_score_participant(participant_id));

-- score_audit inserts happen only via the security-definer trigger; no client insert policy.

-- ── Realtime ──────────────────────────────────────────────────────────────────
-- Broadcast score changes so subscribers (web scoreboard + other groups' phones)
-- update in <1s. replica identity full so UPDATE payloads carry all columns.
alter table public.live_scores replica identity full;
alter publication supabase_realtime add table public.live_scores;
alter publication supabase_realtime add table public.events;
