# Match Play Implementation Plan

## Repository Assessment

`/Users/jackson/Documents/Match Play` started as an empty Git repository on `main` with no commits, no source files, and no remote. The normal shell did not expose `node`, `npm`, `npx`, `supabase`, or `maestro`; Codex provides Node and pnpm through the bundled runtime.

## Architecture Decisions

- Mobile app: Expo, React Native, TypeScript, Expo Router.
- Backend: Supabase Auth, PostgreSQL, Realtime-ready tables, Storage placeholders, and SQL functions for trusted or concurrent actions.
- State: TanStack Query for server/cache state; Zustand only for local drafts and development entitlements.
- Forms and validation: React Hook Form and Zod.
- Integrations: all external dependencies behind provider interfaces. MVP adapters are simulated or local where credentials are unavailable.
- Tee times: simulated inventory only, clearly labeled as demo data. No booking fee or markup logic exists.
- Handicap: Match Play estimates are explicitly labeled as estimates. GHIN integration is a non-network stub until approved access exists.

## Missing Tools and Credentials

- Supabase CLI is not installed on PATH.
- Maestro is not installed on PATH.
- Expo/EAS account and signing credentials are not configured.
- Supabase hosted project URL and anon key are not configured.
- RevenueCat production API keys are not configured.
- Apple, Google, GHIN, and real tee-time provider credentials are not configured.

Development uses `.env.example`, mock auth-friendly flows, mock entitlements, simulated tee times, and documented integration seams.

## Phases and Acceptance Criteria

### Phase 1: Foundation

Expo shell, five-tab navigation, auth/onboarding/profile flows, design system, Supabase client, env validation, docs, base migrations, seeds, tests.

Acceptance: a user can create a development account, complete onboarding, reopen the app, and remain authenticated. Lint, typecheck, and tests pass.

### Phase 2: Courses and Tee Times

Course schema, simulated provider, search/filter/sort, tee-time detail, simulated booking, upcoming bookings.

Acceptance: a user can search seeded fictional tee times, book without payment or fees, and see the booking under upcoming rounds.

### Phase 3: Scoring and Handicap

Round creation, hole scoring, local drafts, round summary, estimated handicap service, handicap history, GHIN stub.

Acceptance: a user can complete and resume an 18-hole round, submit it, and see stats plus a clearly labeled Match Play Estimate.

### Phase 4: Games and Discovery

Discovery preferences, swipe actions, mutual matches, open games, join requests, waitlist, blocking, reports.

Acceptance: two seeded users can mutually match, and joining a game cannot overfill capacity.

### Phase 5: Messaging and Notifications

Realtime-ready conversations, optimistic messages, notification center, local reminders, preferences.

Acceptance: only authorized members can read/send conversation messages; blocked users cannot interact.

### Phase 6: Leaderboards and Match Play

Leaderboard service, point events, privacy filtering, match challenge/scoring/verification.

Acceptance: eligible verified activity updates leaderboards and a head-to-head match can be completed and verified.

### Phase 7: Subscriptions

Subscription interface, mock provider, RevenueCat seam, paywall, free/Pro feature gates.

Acceptance: development accounts can switch entitlement states and safety/privacy tools remain free.

### Phase 8: Hardening

Accessibility review, RLS tests, final setup docs, EAS prep, Maestro flows, MVP limitation review.

Acceptance: app runs locally, migrations and seeds recreate data, and available automated checks pass.

## Risk Register

- Package installation requires network access.
- Local Supabase and Maestro execution require tools not currently installed.
- Real provider integrations require future credentials and commercial approval.
- Location-based social features require legal/privacy review before production launch.
- Official handicap language must remain strict: only approved provider data can be called official or verified.

