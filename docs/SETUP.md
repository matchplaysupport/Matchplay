# Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies with the bundled pnpm if normal pnpm is not on PATH:

```sh
PATH=/Users/jackson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/jackson/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH pnpm install
```

3. Start the app:

```sh
pnpm start
```

4. Optional Supabase local setup requires the Supabase CLI:

```sh
supabase start
supabase db reset
```

5. Optional E2E requires Maestro:

```sh
maestro test maestro
```

Development defaults use simulated data and mock entitlement behavior. Do not add service-role keys to client environment files.

