export type Entitlement = "free" | "pro";

export interface SubscriptionProvider {
  getEntitlement(userId: string): Promise<Entitlement>;
  setMockEntitlement?(entitlement: Entitlement): void;
  canUseFeature(userId: string, feature: ProFeature): Promise<boolean>;
}

export type ProFeature =
  | "discovery_undo"
  | "advanced_filters"
  | "state_national_leaderboards"
  | "unlimited_open_games";

export class MockSubscriptionProvider implements SubscriptionProvider {
  private entitlement: Entitlement = "free";

  async getEntitlement() {
    return Promise.resolve(this.entitlement);
  }

  setMockEntitlement(entitlement: Entitlement) {
    this.entitlement = entitlement;
  }

  async canUseFeature(_userId: string, feature: ProFeature) {
    const safetyFreeFeatures: ProFeature[] = [];
    return Promise.resolve(this.entitlement === "pro" || safetyFreeFeatures.includes(feature));
  }
}
