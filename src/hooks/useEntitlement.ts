import { useQuery } from "@tanstack/react-query";
import { env } from "@/lib/env";
import { useAppStore } from "@/stores/appStore";
import {
  MockSubscriptionProvider,
  SupabaseSubscriptionProvider,
  entitlementCanUse,
  type Entitlement,
  type Feature,
} from "@/integrations/payments/SubscriptionProvider";

// Mock entitlements in local dev; live entitlements (Stripe-fed) otherwise.
const provider = env.EXPO_PUBLIC_USE_MOCK_ENTITLEMENTS
  ? new MockSubscriptionProvider()
  : new SupabaseSubscriptionProvider();

/**
 * Resolves the current golfer's entitlement and exposes a `can(feature)` gate.
 * Reads from the same SubscriptionProvider the Stripe webhook feeds, so paid
 * tiers actually unlock features in the app.
 */
export function useEntitlement() {
  const profileId = useAppStore((s) => s.profile?.id);

  const { data: entitlement = "free", isLoading } = useQuery<Entitlement>({
    queryKey: ["entitlement", profileId],
    queryFn: () =>
      profileId ? provider.getEntitlement(profileId) : Promise.resolve("free"),
    enabled: Boolean(profileId),
    staleTime: 60_000,
  });

  return {
    entitlement,
    isLoading,
    can: (feature: Feature) => entitlementCanUse(entitlement, feature),
  };
}
