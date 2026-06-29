import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";
import type { HandicapAuditResult } from "@/services/handicap";
import type { HandicapSource, Round } from "@/types/domain";

export interface SaveRoundInput {
  /** `profiles.id` of the golfer who played the round. */
  profileId: string;
  round: Round;
  /** Handicap recomputed from the player's rounds *including* this one. */
  handicap: HandicapAuditResult;
}

export interface RoundsProvider {
  /** Persist a submitted round and refresh the player's stored handicap. */
  save(input: SaveRoundInput): Promise<void>;
}

/**
 * Mock-mode provider — a no-op. In mock mode the Zustand store (AsyncStorage)
 * is the source of truth for rounds, so there is nothing to push.
 */
export class SimulatedRoundsProvider implements RoundsProvider {
  async save(): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * Live provider — writes the round and its holes to Supabase and updates the
 * golfer's `handicap_value`/`handicap_source` so leaderboards and other
 * surfaces stay in sync. The two stats pages then read from these tables.
 */
export class SupabaseRoundsProvider implements RoundsProvider {
  async save({ profileId, round, handicap }: SaveRoundInput): Promise<void> {
    const grossScore = round.scores.reduce((sum, s) => sum + s.grossScore, 0);

    const { error: roundError } = await supabase.from("rounds").upsert({
      id: round.id,
      profile_id: profileId,
      course_id: round.courseId,
      tee_set_id: round.teeSetId,
      format: round.format,
      holes: round.holes,
      verification_state: round.verificationState,
      gross_score: grossScore,
      submitted_at: round.submittedAt ?? new Date().toISOString(),
    });
    if (roundError) throw roundError;

    // Replace holes wholesale so re-submits stay consistent.
    const { error: deleteError } = await supabase
      .from("round_holes")
      .delete()
      .eq("round_id", round.id);
    if (deleteError) throw deleteError;

    const { error: holesError } = await supabase.from("round_holes").insert(
      round.scores.map((hole) => ({
        round_id: round.id,
        hole_number: hole.holeNumber,
        gross_score: hole.grossScore,
        putts: hole.putts,
        fairway: hole.fairway,
        green_in_regulation: hole.greenInRegulation,
        penalty_strokes: hole.penaltyStrokes,
        notes: hole.notes ?? null,
      })),
    );
    if (holesError) throw holesError;

    if (handicap.value != null) {
      const source: HandicapSource = "match_play_estimate";
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ handicap_value: handicap.value, handicap_source: source })
        .eq("id", profileId);
      if (profileError) throw profileError;
    }
  }
}

export function getRoundsProvider(): RoundsProvider {
  return env.EXPO_PUBLIC_USE_MOCK_AUTH
    ? new SimulatedRoundsProvider()
    : new SupabaseRoundsProvider();
}
