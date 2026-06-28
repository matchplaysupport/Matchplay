# Testing

Required checks:

```sh
pnpm lint
pnpm typecheck
pnpm test
```

Domain services have unit tests for handicap estimates, playing handicap, match-play result formatting, leaderboard points, distance calculation, open-game capacity, subscription gates, privacy projection, and round statistics.

Maestro flows are stored in `maestro/` for onboarding, simulated tee-time booking, short round completion, open-game creation/joining, matching, leaderboards, and paywall viewing. Running them requires the Maestro CLI.

Supabase RLS tests are stored in `supabase/tests/` as executable SQL scenarios for local Supabase projects.

