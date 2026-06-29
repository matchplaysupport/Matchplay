insert into public.profiles (display_name, username, city, state, zip_code, skill_level, handicap_source, handicap_value, preferred_game_style, is_demo)
values
  ('Jackson Reed', 'jreed', 'Nashville', 'TN', '37212', 'recreational', 'match_play_estimate', 13.2, 'both', true),
  ('Maya Brooks', 'mbrooks', 'Franklin', 'TN', '37064', 'competitive', 'official_unverified', 6.4, 'competitive', true),
  ('Avery Sloan', 'asloan', 'Knoxville', 'TN', '37919', 'casual', 'none', null, 'casual', true);

insert into public.courses (name, facility_name, city, state, zip_code, latitude, longitude, amenities, is_demo)
values
  ('Riverbend Commons', 'Riverbend Golf Collective', 'Nashville', 'TN', '37212', 36.141, -86.812, array['Range','Putting green'], true),
  ('Copper Hill Nine', 'Copper Hill Golf Yard', 'Knoxville', 'TN', '37919', 35.934, -84.012, array['Short game area'], true);

-- ── Live-scoring pilot event ────────────────────────────────────────────────────
-- A junior event with a public scoreboard at /live/riverbend-junior-open.
-- Sign in as 'jreed' (scorer for group 1) to enter scores in the app.

insert into public.course_holes (course_id, hole_number, par, stroke_index)
select c.id, v.hole_number, v.par, v.hole_number
from public.courses c,
  (values (1,4),(2,5),(3,3),(4,4),(5,4),(6,3),(7,5),(8,4),(9,4),
          (10,4),(11,3),(12,5),(13,4),(14,4),(15,3),(16,4),(17,5),(18,4)) as v(hole_number, par)
where c.name = 'Riverbend Commons'
on conflict (course_id, hole_number) do nothing;

insert into public.events
  (id, name, slug, event_type, organizer_id, course_id, holes, scoring_mode, status, public_scoreboard, free_for_participants, starts_at)
select
  'aaaaaaaa-0000-4000-8000-0000000000e1',
  'Riverbend Junior Open', 'riverbend-junior-open', 'junior',
  (select id from public.profiles where username = 'mbrooks'),
  (select id from public.courses where name = 'Riverbend Commons'),
  18, 'group_scorer', 'in_progress', true, true, now()
on conflict (slug) do nothing;

insert into public.event_participants (id, event_id, display_name, group_no, starting_hole, status)
values
  ('aaaaaaaa-0000-4000-8000-000000000001','aaaaaaaa-0000-4000-8000-0000000000e1','Avery Chen',1,1,'active'),
  ('aaaaaaaa-0000-4000-8000-000000000002','aaaaaaaa-0000-4000-8000-0000000000e1','Mason Park',1,1,'active'),
  ('aaaaaaaa-0000-4000-8000-000000000003','aaaaaaaa-0000-4000-8000-0000000000e1','Sofia Ruiz',1,1,'active'),
  ('aaaaaaaa-0000-4000-8000-000000000004','aaaaaaaa-0000-4000-8000-0000000000e1','Liam Brooks',1,1,'active'),
  ('aaaaaaaa-0000-4000-8000-000000000005','aaaaaaaa-0000-4000-8000-0000000000e1','Emma Davis',2,1,'active'),
  ('aaaaaaaa-0000-4000-8000-000000000006','aaaaaaaa-0000-4000-8000-0000000000e1','Noah Kim',2,1,'active'),
  ('aaaaaaaa-0000-4000-8000-000000000007','aaaaaaaa-0000-4000-8000-0000000000e1','Olivia Tran',2,1,'active'),
  ('aaaaaaaa-0000-4000-8000-000000000008','aaaaaaaa-0000-4000-8000-0000000000e1','Ethan Cole',2,1,'active')
on conflict (id) do nothing;

insert into public.event_scorers (event_id, profile_id, group_no)
select 'aaaaaaaa-0000-4000-8000-0000000000e1', id, 1 from public.profiles where username = 'jreed'
on conflict (event_id, profile_id, group_no) do nothing;

insert into public.event_scorers (event_id, profile_id, group_no)
select 'aaaaaaaa-0000-4000-8000-0000000000e1', id, null from public.profiles where username = 'mbrooks'
on conflict (event_id, profile_id, group_no) do nothing;

insert into public.live_scores (event_id, participant_id, hole_number, strokes, entered_by)
select 'aaaaaaaa-0000-4000-8000-0000000000e1', v.pid, v.hole, v.strokes,
  (select id from public.profiles where username = 'jreed')
from (values
  ('aaaaaaaa-0000-4000-8000-000000000001',1,4),('aaaaaaaa-0000-4000-8000-000000000001',2,4),('aaaaaaaa-0000-4000-8000-000000000001',3,3),('aaaaaaaa-0000-4000-8000-000000000001',4,4),('aaaaaaaa-0000-4000-8000-000000000001',5,3),
  ('aaaaaaaa-0000-4000-8000-000000000002',1,5),('aaaaaaaa-0000-4000-8000-000000000002',2,5),('aaaaaaaa-0000-4000-8000-000000000002',3,4),('aaaaaaaa-0000-4000-8000-000000000002',4,4),('aaaaaaaa-0000-4000-8000-000000000002',5,4),
  ('aaaaaaaa-0000-4000-8000-000000000003',1,4),('aaaaaaaa-0000-4000-8000-000000000003',2,6),('aaaaaaaa-0000-4000-8000-000000000003',3,3),('aaaaaaaa-0000-4000-8000-000000000003',4,5),('aaaaaaaa-0000-4000-8000-000000000003',5,4),
  ('aaaaaaaa-0000-4000-8000-000000000004',1,4),('aaaaaaaa-0000-4000-8000-000000000004',2,5),('aaaaaaaa-0000-4000-8000-000000000004',3,2),('aaaaaaaa-0000-4000-8000-000000000004',4,4),('aaaaaaaa-0000-4000-8000-000000000004',5,4)
) as v(pid, hole, strokes)
on conflict (participant_id, hole_number) do nothing;

insert into public.live_scores (event_id, participant_id, hole_number, strokes, entered_by)
select 'aaaaaaaa-0000-4000-8000-0000000000e1', v.pid, v.hole, v.strokes,
  (select id from public.profiles where username = 'mbrooks')
from (values
  ('aaaaaaaa-0000-4000-8000-000000000005',1,3),('aaaaaaaa-0000-4000-8000-000000000005',2,5),('aaaaaaaa-0000-4000-8000-000000000005',3,3),
  ('aaaaaaaa-0000-4000-8000-000000000006',1,5),('aaaaaaaa-0000-4000-8000-000000000006',2,6),('aaaaaaaa-0000-4000-8000-000000000006',3,4),
  ('aaaaaaaa-0000-4000-8000-000000000007',1,4),('aaaaaaaa-0000-4000-8000-000000000007',2,4),('aaaaaaaa-0000-4000-8000-000000000007',3,3),
  ('aaaaaaaa-0000-4000-8000-000000000008',1,4),('aaaaaaaa-0000-4000-8000-000000000008',2,5),('aaaaaaaa-0000-4000-8000-000000000008',3,3)
) as v(pid, hole, strokes)
on conflict (participant_id, hole_number) do nothing;

