// Career-stats aggregation for the web golfer dashboard.
//
// This mirrors the pure logic in the Expo app's `src/services/careerStats.ts`
// and `src/services/handicap.ts`. The two packages have separate module
// resolution (the app's `@/` alias points at the React Native source), so we
// can't import the app version directly without a shared workspace package.
// Keep this in sync with the app until that refactor lands. The shapes here
// match the Supabase `rounds` + `round_holes` rows the page queries.

export interface StatRoundHole {
  hole_number: number;
  gross_score: number;
  putts: number;
  fairway: string;
  green_in_regulation: boolean;
  penalty_strokes: number;
}

export interface StatRound {
  id: string;
  holes: number;
  verification_state: string;
  submitted_at: string | null;
  created_at: string;
  round_holes: StatRoundHole[];
}

export interface DifferentialPoint {
  roundId: string;
  date: string;
  differential: number;
}

export interface HandicapEstimate {
  value: number | null;
  roundsUsed: number;
  explanation: string;
}

export interface CareerStats {
  roundsPlayed: number;
  eligibleRounds: number;
  handicap: HandicapEstimate;
  scoringAverage: number | null;
  averagePutts: number | null;
  fairwaysHitPct: number | null;
  greensInRegulationPct: number | null;
  bestGross: { roundId: string; grossScore: number } | null;
  trend: DifferentialPoint[];
}

const ASSUMED_RATING_18 = 70.2;
const ASSUMED_RATING_9 = 34.8;
const ASSUMED_SLOPE = 123;

const differential = (gross: number, rating: number, slope: number) =>
  Number((((gross - rating) * 113) / slope).toFixed(1));

const isEligible = (round: StatRound): boolean =>
  round.verification_state !== "draft" &&
  round.verification_state !== "rejected" &&
  round.round_holes.length >= 9;

const grossOf = (round: StatRound): number =>
  round.round_holes.reduce((sum, h) => sum + h.gross_score, 0);

const ratingFor = (holes: number) => (holes === 9 ? ASSUMED_RATING_9 : ASSUMED_RATING_18);
const whenOf = (round: StatRound) => round.submitted_at ?? round.created_at;

/** Clubhouse Estimate — average of the best ~half of eligible differentials. */
function estimateHandicap(eligible: StatRound[]): HandicapEstimate {
  if (eligible.length === 0) {
    return { value: null, roundsUsed: 0, explanation: "No eligible submitted rounds yet." };
  }
  const differentials = eligible.map((round) =>
    differential(grossOf(round), ratingFor(round.holes), ASSUMED_SLOPE),
  );
  const roundsUsed = Math.min(Math.max(1, Math.ceil(differentials.length / 2)), 8);
  const best = [...differentials].sort((a, b) => a - b).slice(0, roundsUsed);
  const average = best.reduce((sum, v) => sum + v, 0) / best.length;
  return {
    value: Number(average.toFixed(1)),
    roundsUsed,
    explanation:
      "Clubhouse Estimate based on eligible submitted rounds. This is not an official USGA Handicap Index.",
  };
}

export function calculateCareerStats(rounds: StatRound[]): CareerStats {
  const eligible = rounds.filter(isEligible);
  const allHoles = eligible.flatMap((round) => round.round_holes);

  const totalPutts = allHoles.reduce((sum, h) => sum + h.putts, 0);
  const fairwayHoles = allHoles.filter((h) => h.fairway !== "not_applicable");
  const fairwaysHit = fairwayHoles.filter((h) => h.fairway === "hit").length;
  const greensHit = allHoles.filter((h) => h.green_in_regulation).length;

  const relativeScores = eligible.map((round) => grossOf(round) - (round.holes === 9 ? 36 : 72));

  const best = eligible.reduce<{ roundId: string; grossScore: number } | null>((acc, round) => {
    const gross = grossOf(round);
    if (!acc || gross < acc.grossScore) return { roundId: round.id, grossScore: gross };
    return acc;
  }, null);

  const trend: DifferentialPoint[] = [...eligible]
    .sort((a, b) => whenOf(a).localeCompare(whenOf(b)))
    .map((round) => ({
      roundId: round.id,
      date: whenOf(round),
      differential: differential(grossOf(round), ratingFor(round.holes), ASSUMED_SLOPE),
    }));

  const avg = (total: number, count: number): number | null =>
    count === 0 ? null : Number((total / count).toFixed(1));

  return {
    roundsPlayed: rounds.length,
    eligibleRounds: eligible.length,
    handicap: estimateHandicap(eligible),
    scoringAverage: avg(relativeScores.reduce((s, v) => s + v, 0), relativeScores.length),
    averagePutts: avg(totalPutts, allHoles.length),
    fairwaysHitPct:
      fairwayHoles.length === 0 ? null : Math.round((fairwaysHit / fairwayHoles.length) * 100),
    greensInRegulationPct:
      allHoles.length === 0 ? null : Math.round((greensHit / allHoles.length) * 100),
    bestGross: best,
    trend,
  };
}
