type AnalyticsEvent =
  | "onboarding_completed"
  | "tee_time_searched"
  | "tee_time_viewed"
  | "concierge_booking_requested"
  | "simulated_booking_completed"
  | "booking_completed"
  | "round_started"
  | "hole_scored"
  | "round_completed"
  | "round_sync_failed"
  | "handicap_viewed"
  | "leaderboard_viewed"
  | "discovery_swipe"
  | "player_matched"
  | "open_game_created"
  | "join_requested"
  | "join_accepted"
  | "message_sent"
  | "paywall_viewed"
  | "trial_started"
  | "subscription_started"
  | "subscription_restored";

export const analytics = {
  track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}) {
    if (__DEV__) {
      console.info("[analytics]", event, properties);
    }
  },
};
