# Database

The MVP database uses UUID primary keys, `created_at`, `updated_at`, foreign keys, check constraints, and RLS on user-accessible tables. PostGIS is not required for local MVP setup; latitude/longitude columns and a tested Haversine utility are used until a Supabase project enables geospatial extensions.

Core areas:

- identity: profiles, settings, privacy, locations
- golf data: courses, holes, tee sets, tee times, bookings
- scoring: rounds, players, holes, verification, disputes, handicap history
- social: friendships, blocks, reports, discovery actions, matches
- games: open games, members, join requests, waitlist
- messaging: conversations, members, messages
- notifications: notifications, preferences, devices
- business: subscription entitlements
- administration: point events, leaderboard entries, audit logs, admin actions

Precise home coordinates are private. Public discovery uses generalized city/state and approximate distance only.

