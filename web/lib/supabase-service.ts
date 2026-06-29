import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — BYPASSES RLS. Server-only; never import this
 * into a Client Component or anything that ships to the browser. Used by signup
 * API routes to write profile/application rows on behalf of a user who has just
 * signed up but hasn't confirmed their email yet (so has no session).
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
