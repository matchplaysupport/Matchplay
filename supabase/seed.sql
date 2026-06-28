insert into public.profiles (display_name, username, city, state, zip_code, skill_level, handicap_source, handicap_value, preferred_game_style, is_demo)
values
  ('Jackson Reed', 'jreed', 'Nashville', 'TN', '37212', 'recreational', 'match_play_estimate', 13.2, 'both', true),
  ('Maya Brooks', 'mbrooks', 'Franklin', 'TN', '37064', 'competitive', 'official_unverified', 6.4, 'competitive', true),
  ('Avery Sloan', 'asloan', 'Knoxville', 'TN', '37919', 'casual', 'none', null, 'casual', true);

insert into public.courses (name, facility_name, city, state, zip_code, latitude, longitude, amenities, is_demo)
values
  ('Riverbend Commons', 'Riverbend Golf Collective', 'Nashville', 'TN', '37212', 36.141, -86.812, array['Range','Putting green'], true),
  ('Copper Hill Nine', 'Copper Hill Golf Yard', 'Knoxville', 'TN', '37919', 35.934, -84.012, array['Short game area'], true);

