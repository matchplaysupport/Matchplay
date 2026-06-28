# Architecture

Match Play is organized around vertical product features with shared infrastructure.

- `app/` contains Expo Router routes.
- `src/design-system/` contains reusable tokens and primitives.
- `src/features/` contains product workflows.
- `src/integrations/` contains provider interfaces and adapters.
- `src/services/` contains testable domain logic.
- `supabase/` contains migrations, seeds, functions, and database tests.

Screens do not branch on mock providers. They call stable interfaces that are wired to simulated, mock, or future production adapters.

Trusted operations that require authorization or concurrency, such as joining open games, submitting rounds, verification, leaderboard recalculation, and account deletion, belong in Supabase SQL or Edge Functions rather than client-only code.

