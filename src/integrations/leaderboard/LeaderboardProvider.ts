import { demoLeaderboard } from "@/features/courses/demoData";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";
import type { LeaderboardEntry } from "@/types/domain";

export type LeaderboardScope = "local" | "state" | "national" | "friends";
export type LeaderboardPeriod = "weekly" | "monthly" | "seasonal";

export interface LeaderboardProvider {
  list(scope: LeaderboardScope, period: LeaderboardPeriod): Promise<LeaderboardEntry[]>;
}

/** Mock-mode provider — the seeded demo standings. */
export class SimulatedLeaderboardProvider implements LeaderboardProvider {
  async list(): Promise<LeaderboardEntry[]> {
    return Promise.resolve(demoLeaderboard);
  }
}

type LeaderboardJoinRow = {
  rank: number;
  points: number;
  verified: boolean;
  profile_id: string;
  profiles: {
    display_name: string;
    city: string;
    state: string;
    handicap_value: number | null;
  } | null;
};

/** Live provider — ranked rows from `leaderboard_entries` for the scope/period. */
export class SupabaseLeaderboardProvider implements LeaderboardProvider {
  async list(scope: LeaderboardScope, period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from("leaderboard_entries")
      .select("rank, points, verified, profile_id, profiles(display_name, city, state, handicap_value)")
      .eq("scope", scope)
      .eq("period", period)
      .order("rank", { ascending: true })
      .limit(100);

    if (error || !data) return [];

    return (data as unknown as LeaderboardJoinRow[]).map((row) => {
      const prof = row.profiles;
      const handicap = prof?.handicap_value;
      return {
        rank: row.rank,
        playerId: row.profile_id,
        displayName: prof?.display_name ?? "Golfer",
        location: prof ? `${prof.city}, ${prof.state}` : "",
        metricLabel: handicap != null ? `${Number(handicap).toFixed(1)} HCP` : "No handicap",
        points: row.points,
        verified: row.verified,
        movement: 0,
      };
    });
  }
}

export function getLeaderboardProvider(): LeaderboardProvider {
  return env.EXPO_PUBLIC_USE_MOCK_AUTH
    ? new SimulatedLeaderboardProvider()
    : new SupabaseLeaderboardProvider();
}
