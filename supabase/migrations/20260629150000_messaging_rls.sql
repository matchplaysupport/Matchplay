-- Messaging RLS backfill.
--
-- conversations and conversation_members had RLS ENABLED but NO policies in the
-- initial schema (20260627180000), which silently denies every read/write for
-- normal authenticated users (service role bypasses RLS, so it stayed hidden
-- until live mode: root .env EXPO_PUBLIC_USE_MOCK_AUTH=false). Without these,
-- direct/open_game/match chat is completely broken for real users.
--
-- The membership-based model below mirrors the live_events migration
-- (20260629140000): authorization goes through a SECURITY DEFINER helper so the
-- conversation_members policies don't recurse into their own RLS.
--
-- messages already shipped both a SELECT and an INSERT policy in the initial
-- schema; they're re-asserted here (idempotently) so this file is the single
-- source of truth for messaging RLS. Re-runnable via drop-if-exists.

-- ── Authorization helper (security definer so policies don't recurse into RLS) ─
-- True when the current auth user owns a profile that is a member of the given
-- conversation. SECURITY DEFINER + empty search_path means its internal reads
-- bypass RLS, so referencing it inside conversation_members' own policies is
-- safe (no "infinite recursion detected in policy" error).

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.conversation_members cm
    join public.profiles pr on pr.id = cm.profile_id
    where cm.conversation_id = p_conversation_id
      and pr.auth_user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to authenticated, service_role;

-- ── conversations ─────────────────────────────────────────────────────────────
-- Read a conversation only if you're a member of it.
drop policy if exists "conversations member read" on public.conversations;
create policy "conversations member read" on public.conversations
  for select using (public.is_conversation_member(id));

-- Any authenticated user may create a conversation row. This is the bootstrap
-- for a brand-new direct chat: the conversation must exist before its member
-- rows can reference it, so membership can't be checked yet. Creation normally
-- goes through public.create_direct_conversation() below (which also adds both
-- members atomically); a bare INSERT here only yields an orphan conversation the
-- creator can't even read until they add themselves, so this is low-risk.
drop policy if exists "conversations authenticated insert" on public.conversations;
create policy "conversations authenticated insert" on public.conversations
  for insert to authenticated with check (true);

-- ── conversation_members ──────────────────────────────────────────────────────
-- See every member row of any conversation you belong to (renders chat rosters
-- and powers the messages + conversations policies, which read membership).
drop policy if exists "conversation_members member read" on public.conversation_members;
create policy "conversation_members member read" on public.conversation_members
  for select using (public.is_conversation_member(conversation_id));

-- Insert a membership row for yourself (joining a group/match chat), or add
-- others to a conversation you're already in. Brand-new direct chats are
-- bootstrapped via create_direct_conversation() (SECURITY DEFINER), which is
-- why the creator doesn't need to be a member yet for that path.
drop policy if exists "conversation_members self or member insert" on public.conversation_members;
create policy "conversation_members self or member insert" on public.conversation_members
  for insert with check (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
    or public.is_conversation_member(conversation_id)
  );

-- Update only your own membership row (e.g. advancing last_read_at).
drop policy if exists "conversation_members own update" on public.conversation_members;
create policy "conversation_members own update" on public.conversation_members
  for update using (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  ) with check (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- Leave a conversation by deleting your own membership row.
drop policy if exists "conversation_members own delete" on public.conversation_members;
create policy "conversation_members own delete" on public.conversation_members
  for delete using (
    profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- ── messages (re-assert the initial-schema policies idempotently) ─────────────
drop policy if exists "messages conversation members read" on public.messages;
create policy "messages conversation members read" on public.messages
  for select using (public.is_conversation_member(conversation_id));

drop policy if exists "messages conversation members insert" on public.messages;
create policy "messages conversation members insert" on public.messages
  for insert with check (
    sender_id in (select id from public.profiles where auth_user_id = auth.uid())
    and public.is_conversation_member(conversation_id)
  );

-- ── Direct-conversation bootstrap RPC ─────────────────────────────────────────
-- Atomically returns the existing 1:1 direct conversation between the caller and
-- p_other_profile_id, or creates it (conversation + both member rows) if none
-- exists. SECURITY DEFINER so it can write the second member row without tripping
-- the per-row INSERT policy. Mirrors the join_open_game() / live_events pattern.

create or replace function public.create_direct_conversation(p_other_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid;
  v_conversation_id uuid;
begin
  select id into v_me
  from public.profiles
  where auth_user_id = auth.uid()
  limit 1;

  if v_me is null then
    raise exception 'no profile for current user';
  end if;

  if p_other_profile_id is null or p_other_profile_id = v_me then
    raise exception 'invalid other profile';
  end if;

  -- Reuse an existing 1:1 direct conversation with exactly these two members.
  select c.id into v_conversation_id
  from public.conversations c
  where c.type = 'direct'
    and exists (
      select 1 from public.conversation_members m
      where m.conversation_id = c.id and m.profile_id = v_me
    )
    and exists (
      select 1 from public.conversation_members m
      where m.conversation_id = c.id and m.profile_id = p_other_profile_id
    )
    and (
      select count(*) from public.conversation_members m where m.conversation_id = c.id
    ) = 2
  limit 1;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  insert into public.conversations (type)
  values ('direct')
  returning id into v_conversation_id;

  insert into public.conversation_members (conversation_id, profile_id)
  values (v_conversation_id, v_me),
         (v_conversation_id, p_other_profile_id);

  return v_conversation_id;
end;
$$;

revoke all on function public.create_direct_conversation(uuid) from public;
grant execute on function public.create_direct_conversation(uuid) to authenticated, service_role;
