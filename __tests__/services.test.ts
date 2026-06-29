import { demoCourses } from "@/features/courses/demoData";
import { calculateEstimatedHandicap } from "@/services/handicap";
import { calculateLeaderboardPoints } from "@/services/leaderboard";
import { allocateMatchStrokes, calculatePlayingHandicap, formatMatchResult } from "@/services/matchPlay";
import { joinOpenGame } from "@/services/openGames";
import { projectPublicProfile } from "@/services/privacy";
import { calculateRoundStats } from "@/services/roundStats";
import { calculateCareerStats } from "@/services/careerStats";
import { distanceMiles } from "@/services/distance";
import type { OpenGame, Profile, Round } from "@/types/domain";

const course = demoCourses[0];
if (!course) {
  throw new Error("Missing demo course");
}

const makeRound = (scores: number[]): Round => ({
  id: "round-1",
  courseId: course.id,
  teeSetId: course.teeSets[0]?.id ?? "tee",
  format: "stroke_play",
  holes: 18,
  verificationState: "self_reported",
  startedAt: "2026-07-01T12:00:00.000Z",
  scores: scores.map((grossScore, index) => ({
    holeNumber: index + 1,
    grossScore,
    putts: 2,
    fairway: "hit",
    greenInRegulation: true,
    penaltyStrokes: 0,
    sandSaveOpportunity: false,
    sandSaveMade: false,
    upAndDownOpportunity: false,
    upAndDownMade: false,
  })),
});

describe("domain services", () => {
  it("calculates geographic distance", () => {
    expect(distanceMiles({ latitude: 36.1627, longitude: -86.7816 }, { latitude: 35.9606, longitude: -83.9207 })).toBeGreaterThan(150);
  });

  it("calculates round statistics", () => {
    const round = makeRound(course.holes.map((hole) => hole.par));
    const stats = calculateRoundStats(round, course);
    expect(stats.relativeToPar).toBe(0);
    expect(stats.totalPutts).toBe(36);
  });

  it("labels handicap estimates from eligible rounds", () => {
    const result = calculateEstimatedHandicap([makeRound(Array(18).fill(5) as number[])]);
    expect(result.value).not.toBeNull();
    expect(result.explanation).toContain("not an official");
  });

  it("aggregates career stats across rounds", () => {
    const par = course.holes.map((hole) => hole.par);
    const rounds: Round[] = [
      { ...makeRound(par), id: "r-1", submittedAt: "2026-07-01T12:00:00.000Z" },
      { ...makeRound(par.map((p) => p + 1)), id: "r-2", submittedAt: "2026-07-08T12:00:00.000Z" },
    ];
    const stats = calculateCareerStats(rounds);
    expect(stats.roundsPlayed).toBe(2);
    expect(stats.eligibleRounds).toBe(2);
    expect(stats.averagePutts).toBe(2);
    expect(stats.greensInRegulationPct).toBe(100);
    expect(stats.bestGross?.roundId).toBe("r-1");
    // Trend is ordered oldest → newest by submission date.
    expect(stats.trend.map((point) => point.roundId)).toEqual(["r-1", "r-2"]);
    expect(stats.handicap.value).not.toBeNull();
  });

  it("returns empty career stats when there are no rounds", () => {
    const stats = calculateCareerStats([]);
    expect(stats.eligibleRounds).toBe(0);
    expect(stats.averagePutts).toBeNull();
    expect(stats.bestGross).toBeNull();
    expect(stats.handicap.value).toBeNull();
  });

  it("calculates playing handicap and stroke allocation", () => {
    expect(calculatePlayingHandicap(10, 125, 71, 72)).toBe(10);
    expect(allocateMatchStrokes(14, 10, [1, 2, 3, 4, 5])).toEqual([1, 1, 1, 1, 0]);
    expect(formatMatchResult(3, 2)).toBe("3 & 2");
  });

  it("awards leaderboard points without duplicate or rejected credit", () => {
    expect(calculateLeaderboardPoints({ completedEligibleRound: true, partnerVerified: true, matchPlayWin: true })).toBe(30);
    expect(calculateLeaderboardPoints({ completedEligibleRound: true, rejected: true })).toBe(0);
  });

  it("prevents open-game overfill by waitlisting when full", () => {
    const game: OpenGame = {
      id: "game",
      courseId: course.id,
      creatorId: "creator",
      startsAt: "2026-07-02T12:00:00.000Z",
      availableSpots: 1,
      acceptedPlayerIds: ["creator"],
      waitlistedPlayerIds: [],
      approvalRequired: false,
      visibility: "public",
    };
    expect(joinOpenGame(game, "player-2").status).toBe("waitlisted");
  });

  it("projects public profiles according to privacy settings", () => {
    const profile: Profile = {
      id: "p1",
      displayName: "Test Golfer",
      username: "test",
      city: "Nashville",
      state: "TN",
      zipCode: "37212",
      skillLevel: "casual",
      handicapSource: "match_play_estimate",
      handicapValue: 11,
      preferredRadiusMiles: 20,
      preferredGameStyle: "both",
      reliabilityLabel: "New player",
      privacy: {
        hideExactAge: true,
        hideHandicap: true,
        hideRoundHistory: false,
        hideProfileDiscovery: false,
        hideApproximateLocation: false,
        hideLeaderboards: false,
      },
    };
    expect(projectPublicProfile(profile)?.handicapLabel).toBeNull();
  });
});
