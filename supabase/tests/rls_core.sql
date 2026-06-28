-- Run with a local Supabase test harness. These scenarios document the critical
-- RLS expectations even when the CLI is not installed in this environment.

-- 1. Users can update only their own profile rows.
-- 2. Users cannot read precise location rows for other profiles.
-- 3. Users can read conversation messages only when they are members.
-- 4. Users cannot insert messages into conversations they do not belong to.
-- 5. Users cannot grant themselves Pro entitlements or administrator status.

