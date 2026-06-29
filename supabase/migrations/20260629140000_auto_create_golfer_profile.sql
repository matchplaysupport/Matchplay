-- Auto-create a golfer profile when a golfer auth user is created.
--
-- Signup previously created the auth user and then inserted the profile in a
-- second step. If that second step failed (e.g. a missing service-role key),
-- the account was left with NO profile and got permanently stuck: re-signup
-- said "already registered" and sign-in said "setup incomplete". This trigger
-- makes the profile row part of the same transaction as the auth user, so it
-- can never go missing. The signup API then fills in city/state/zip.
--
-- Scoped to role = 'golfer' (from signup metadata) so course operators and
-- admins do NOT get a spurious golfer profile.

create or replace function public.handle_new_golfer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_base text;
  v_username text;
begin
  if coalesce(new.raw_user_meta_data->>'role', '') <> 'golfer' then
    return new;
  end if;

  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(split_part(new.email, '@', 1), ''),
    'Golfer'
  );

  -- Build a unique username from the display name (profiles.username is unique).
  v_base := left(lower(regexp_replace(v_name, '[^a-z0-9]', '', 'g')), 20);
  if v_base = '' then
    v_base := 'golfer';
  end if;

  v_username := v_base;
  while exists (select 1 from public.profiles where username = v_username) loop
    v_username := v_base || floor(1000 + random() * 9000)::text;
  end loop;

  insert into public.profiles (
    auth_user_id, display_name, username, city, state, zip_code,
    skill_level, handicap_source, preferred_game_style
  ) values (
    new.id, v_name, v_username, '', '', '',
    'casual', 'none', 'both'
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_golfer on auth.users;
create trigger on_auth_user_created_golfer
  after insert on auth.users
  for each row execute function public.handle_new_golfer();
