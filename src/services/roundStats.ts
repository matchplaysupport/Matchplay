import type { Course, Round } from "@/types/domain";

export interface RoundStats {
  grossScore: number;
  relativeToPar: number;
  totalPutts: number;
  puttsPerHole: number;
  fairwaysHit: number;
  greensInRegulation: number;
  penalties: number;
  frontNineScore: number;
  backNineScore: number;
  pars: number;
  birdies: number;
  eaglesOrBetter: number;
  bogeys: number;
  doublesOrWorse: number;
}

export const calculateRoundStats = (round: Round, course: Course): RoundStats => {
  const holes = round.scores;
  const grossScore = holes.reduce((sum, hole) => sum + hole.grossScore, 0);
  const totalPutts = holes.reduce((sum, hole) => sum + hole.putts, 0);
  const penalties = holes.reduce((sum, hole) => sum + hole.penaltyStrokes, 0);
  const par = holes.reduce((sum, hole) => {
    const courseHole = course.holes.find((item) => item.number === hole.holeNumber);
    return sum + (courseHole?.par ?? 4);
  }, 0);
  const scoreTypes = holes.map((hole) => {
    const courseHole = course.holes.find((item) => item.number === hole.holeNumber);
    return hole.grossScore - (courseHole?.par ?? 4);
  });
  return {
    grossScore,
    relativeToPar: grossScore - par,
    totalPutts,
    puttsPerHole: holes.length === 0 ? 0 : totalPutts / holes.length,
    fairwaysHit: holes.filter((hole) => hole.fairway === "hit").length,
    greensInRegulation: holes.filter((hole) => hole.greenInRegulation).length,
    penalties,
    frontNineScore: holes.slice(0, 9).reduce((sum, hole) => sum + hole.grossScore, 0),
    backNineScore: holes.slice(9, 18).reduce((sum, hole) => sum + hole.grossScore, 0),
    pars: scoreTypes.filter((value) => value === 0).length,
    birdies: scoreTypes.filter((value) => value === -1).length,
    eaglesOrBetter: scoreTypes.filter((value) => value <= -2).length,
    bogeys: scoreTypes.filter((value) => value === 1).length,
    doublesOrWorse: scoreTypes.filter((value) => value >= 2).length,
  };
};
