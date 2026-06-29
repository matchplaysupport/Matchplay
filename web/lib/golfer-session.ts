import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export type Tier = "free" | "plus" | "pro";

export interface GolferProfile {
  id: string;
  display_name: string;
  username: string;
  city: string;
  state: string;
  skill_level: string;
  handicap_value: number | null;
  handicap_source: string;
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Resolve the golfer's tier from subscription_entitlements (lapsed = free). */
export async function resolveTier(supabase: Supabase, profileId: string): Promise<Tier> {
  const { data: ent } = await supabase
    .from("subscription_entitlements")
    .select("entitlement, current_period_end")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!ent || (ent.entitlement !== "plus" && ent.entitlement !== "pro")) return "free";
  const active = !ent.current_period_end || new Date(ent.current_period_end as string) > new Date();
  return active ? (ent.entitlement as Tier) : "free";
}

/**
 * Loads the signed-in golfer for a portal page. Redirects to login if there's
 * no session. Returns a null profile when the account has no profile row yet
 * (the caller renders the "finish setup" notice).
 */
export async function loadGolfer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/golfer/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, city, state, skill_level, handicap_value, handicap_source")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const tier: Tier = profile ? await resolveTier(supabase, profile.id) : "free";
  return { supabase, user, profile: (profile as GolferProfile | null), tier };
}

/** plus features (booking, scoring/handicap) are available to plus and pro. */
export function hasPlus(tier: Tier): boolean {
  return tier === "plus" || tier === "pro";
}

/** pro features (tournaments, state/national leaderboards). */
export function hasPro(tier: Tier): boolean {
  return tier === "pro";
}
