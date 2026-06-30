-- Profile editing + public player profiles.
--
-- Adds free-text profile fields (bio, phone, avatar_url), an avatars storage
-- bucket, and a SECURITY DEFINER function that exposes ONLY public-safe profile
-- columns (RLS is row-level, so a plain public-read policy would leak phone/zip).
-- The function also enforces the user_privacy_settings toggles.

-- ── New columns ───────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists bio text,
  add column if not exists phone text,
  add column if not exists avatar_url text;

-- ── Avatars storage bucket (public read, owner write) ─────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert" on storage.objects
  for insert with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects
  for update using (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete" on storage.objects
  for delete using (bucket_id = 'avatars' and owner = auth.uid());

-- ── Public player profile (column- and privacy-safe) ─────────────────────────
-- Returns a single row for a username, or no rows when the profile is private
-- (hide_profile_discovery). Sensitive columns are never selected; privacy
-- toggles null out handicap / location / rounds. rounds_played is counted here
-- because the rounds table is owner-only under RLS.
create or replace function public.public_player_profile(p_username text)
returns table (
  id uuid,
  display_name text,
  username text,
  avatar_url text,
  bio text,
  skill_level text,
  preferred_game_style text,
  reliability_label text,
  handicap_value numeric,
  city text,
  state text,
  rounds_played integer,
  hide_leaderboards boolean,
  member_since timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.bio,
    p.skill_level,
    p.preferred_game_style,
    p.reliability_label,
    case when coalesce(pr.hide_handicap, false) then null else p.handicap_value end,
    case when coalesce(pr.hide_approximate_location, false) then null else p.city end,
    case when coalesce(pr.hide_approximate_location, false) then null else p.state end,
    case
      when coalesce(pr.hide_round_history, false) then null
      else (select count(*)::int from public.rounds r where r.profile_id = p.id)
    end,
    coalesce(pr.hide_leaderboards, false),
    p.created_at
  from public.profiles p
  left join public.user_privacy_settings pr on pr.profile_id = p.id
  where lower(p.username) = lower(p_username)
    and coalesce(pr.hide_profile_discovery, false) = false;
$$;

grant execute on function public.public_player_profile(text) to anon, authenticated;
