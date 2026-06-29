import type { Round } from "@/types/domain";
import { calculateDifferential, calculateEstimatedHandicap, type HandicapAuditResult } from "@/services/handicap";

/** One point on the handicap trend line — a single eligible round's differential. */
export interface DifferentialPoint {
  roundId: string;
  date: string;
  differential: number;
}

export interface CareerStats {
  roundsPlayed: number;
  /** Rounds that count toward the Clubhouse Estimate (submitted, 9+ holes). */
  eligibleRounds: number;
  handicap: HandicapAuditResult;
  /** Strokes relative to par, averaged across rounds with a known par. */
  scoringAverage: number | null;
  averagePutts: number | null;
  fairwaysHitPct: number | null;
  greensInRegulationPct: number | null;
  /** Lowest gross of any submitted round, with the round it came from. */
  bestGross: { roundId: string; grossScore: number } | null;
  /** Differentials over time, oldest → newest, for a trend chart. */
  trend: DifferentialPoint[];
}

const ASSUMED_RATING_18 = 70.2;
const ASSUMED_RATING_9 = 34.8;
const ASSUMED_SLOPE = 123;

const isEligible = (round: Round): boolean =>
  round.verificationState !== "draft" &&
  round.verificationState !== "rejected" &&
  round.scores.length >= 9;

const grossOf = (round: Round): number => round.scores.reduce((sum, s) => sum + s.grossScore, 0);

/**
 * Aggregate a player's submitted rounds into the numbers the stats/handicap
 * pages render. Pure — shared by the Expo app and the Next.js web app so both
 * surfaces show identical figures. Stat percentages use only holes where the
 * metric applies (e.g. fairways exclude par 3s flagged `not_applicable`).
 */
export const calculateCareerStats = (rounds: Round[]): CareerStats => {
  const eligible = rounds.filter(isEligible);

  const allHoles = eligible.flatMap((round) => round.scores);
  const totalPutts = allHoles.reduce((sum, h) => sum + h.putts, 0);

  const fairwayHoles = allHoles.filter((h) => h.fairway !== "not_applicable");
  const fairwaysHit = fairwayHoles.filter((h) => h.fairway === "hit").length;
  const greensHit = allHoles.filter((h) => h.greenInRegulation).length;

  // Scoring average is expressed relative to an assumed par (no per-hole par
  // here), so we approximate par from hole count: 36 for a nine, 72 for 18.
  const relativeScores = eligible.map((round) => {
    const assumedPar = round.holes === 9 ? 36 : 72;
    return grossOf(round) - assumedPar;
  });

  const best = eligible.reduce<{ roundId: string; grossScore: number } | null>((acc, round) => {
    const gross = grossOf(round);
    if (!acc || gross < acc.grossScore) return { roundId: round.id, grossScore: gross };
    return acc;
  }, null);

  const trend: DifferentialPoint[] = [...eligible]
    .sort((a, b) => (a.submittedAt ?? a.startedAt).localeCompare(b.submittedAt ?? b.startedAt))
    .map((round) => {
      const rating = round.holes === 9 ? ASSUMED_RATING_9 : ASSUMED_RATING_18;
      return {
        roundId: round.id,
        date: round.submittedAt ?? round.startedAt,
        differential: calculateDifferential(grossOf(round), rating, ASSUMED_SLOPE),
      };
    });

  const avg = (total: number, count: number): number | null =>
    count === 0 ? null : Number((total / count).toFixed(1));

  return {
    roundsPlayed: rounds.length,
    eligibleRounds: eligible.length,
    handicap: calculateEstimatedHandicap(rounds),
    scoringAverage: avg(relativeScores.reduce((s, v) => s + v, 0), relativeScores.length),
    averagePutts: avg(totalPutts, allHoles.length),
    fairwaysHitPct:
      fairwayHoles.length === 0 ? null : Math.round((fairwaysHit / fairwayHoles.length) * 100),
    greensInRegulationPct:
      allHoles.length === 0 ? null : Math.round((greensHit / allHoles.length) * 100),
    bestGross: best,
    trend,
  };
};
