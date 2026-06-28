import type { Round } from "@/types/domain";

export interface HandicapAuditResult {
  value: number | null;
  roundsUsed: number;
  explanation: string;
  differentials: number[];
}

export const calculateDifferential = (grossScore: number, rating: number, slope: number) =>
  Number((((grossScore - rating) * 113) / slope).toFixed(1));

export const calculateEstimatedHandicap = (rounds: Round[]): HandicapAuditResult => {
  const eligible = rounds.filter(
    (round) =>
      round.verificationState !== "draft" &&
      round.verificationState !== "rejected" &&
      round.scores.length >= 9,
  );
  const differentials = eligible.map((round) => {
    const gross = round.scores.reduce((sum, score) => sum + score.grossScore, 0);
    const assumedRating = round.holes === 9 ? 34.8 : 70.2;
    const assumedSlope = 123;
    return calculateDifferential(gross, assumedRating, assumedSlope);
  });
  if (differentials.length === 0) {
    return {
      value: null,
      roundsUsed: 0,
      explanation: "No eligible submitted rounds yet.",
      differentials,
    };
  }
  const roundsUsed = Math.min(Math.max(1, Math.ceil(differentials.length / 2)), 8);
  const best = [...differentials].sort((a, b) => a - b).slice(0, roundsUsed);
  const average = best.reduce((sum, value) => sum + value, 0) / best.length;
  return {
    value: Number(average.toFixed(1)),
    roundsUsed,
    explanation: "Clubhouse Estimate based on eligible submitted rounds. This is not an official USGA Handicap Index.",
    differentials,
  };
};
