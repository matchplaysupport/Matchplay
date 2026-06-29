import { supabase } from "@/lib/supabase";

export type Entitlement = "free" | "plus" | "pro";

// Plus gates: booking + personal golf tools
// Pro gates: competitive + organizer tools
export type PlusFeature =
  | "booking"
  | "scoring"
  | "handicap"
  | "personal_stats"
  | "local_leaderboards"
  | "discovery"
  | "messaging";

export type ProFeature =
  | "state_national_leaderboards"
  | "unlimited_open_games"
  | "ranked_match_challenges"
  | "private_groups"
  | "advanced_analytics"
  | "ghin_sync"
  | "create_tournaments"
  | "scramble_organizer"
  | "discovery_undo"
  | "advanced_filters";

export type Feature = PlusFeature | ProFeature;

const PLUS_FEATURES = new Set<Feature>([
  "booking",
  "scoring",
  "handicap",
  "personal_stats",
  "local_leaderboards",
  "discovery",
  "messaging",
]);

export function entitlementCanUse(entitlement: Entitlement, feature: Feature): boolean {
  if (entitlement === "pro") return true;
  if (entitlement === "plus") return PLUS_FEATURES.has(feature);
  return false;
}

export interface SubscriptionProvider {
  getEntitlement(userId: string): Promise<Entitlement>;
  setMockEntitlement?(entitlement: Entitlement): void;
  canUseFeature(userId: string, feature: Feature): Promise<boolean>;
}

export class MockSubscriptionProvider implements SubscriptionProvider {
  private entitlement: Entitlement = "free";

  async getEntitlement() {
    return Promise.resolve(this.entitlement);
  }

  setMockEntitlement(entitlement: Entitlement) {
    this.entitlement = entitlement;
  }

  async canUseFeature(_userId: string, feature: Feature) {
    return Promise.resolve(entitlementCanUse(this.entitlement, feature));
  }
}

export class SupabaseSubscriptionProvider implements SubscriptionProvider {
  async getEntitlement(userId: string): Promise<Entitlement> {
    const { data } = await supabase
      .from("subscription_entitlements")
      .select("entitlement, current_period_end")
      .eq("profile_id", userId)
      .single();

    if (!data) return "free";

    // Treat as free if subscription has lapsed
    if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
      return "free";
    }

    return (data.entitlement as Entitlement) ?? "free";
  }

  async canUseFeature(userId: string, feature: Feature): Promise<boolean> {
    const entitlement = await this.getEntitlement(userId);
    return entitlementCanUse(entitlement, feature);
  }
}
