import { supabase } from "@/lib/supabase";
import type { DiscoveryProfile, HandicapSource, SkillLevel } from "@/types/domain";

type ProfileRow = {
  id: string;
  display_name: string;
  city: string;
  state: string;
  skill_level: SkillLevel;
  handicap_value: number | null;
  handicap_source: HandicapSource;
  preferred_game_style: "casual" | "competitive" | "both";
  reliability_label: DiscoveryProfile["reliabilityLabel"];
};

/**
 * Live player discovery — real golfers from Supabase, excluding the current
 * user and demo seed rows. Fields the profiles table doesn't carry yet
 * (distance, bio, tags, match record) default to empty/zero so the UI renders
 * real-but-sparse cards instead of fabricated data.
 */
export async function listDiscoveryProfiles(): Promise<DiscoveryProfile[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const authUserId = sessionData.session?.user?.id;

  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, city, state, skill_level, handicap_value, handicap_source, preferred_game_style, reliability_label",
    )
    .eq("is_demo", false)
    .limit(50);

  if (authUserId) query = query.neq("auth_user_id", authUserId);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as ProfileRow[]).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    approximateLocation: `${row.city}, ${row.state}`,
    distanceMiles: 0,
    skillLevel: row.skill_level,
    handicapValue: row.handicap_value ?? undefined,
    handicapSource: row.handicap_source,
    preferredGameStyle: row.preferred_game_style,
    reliabilityLabel: row.reliability_label,
    tags: [],
    roundsPlayed: 0,
    matchPlayRecord: { wins: 0, losses: 0 },
  }));
}
