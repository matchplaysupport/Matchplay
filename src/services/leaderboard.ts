export interface PointEventInput {
  completedEligibleRound?: boolean;
  partnerVerified?: boolean;
  matchPlayWin?: boolean;
  personalBest?: boolean;
  reliabilityMilestone?: boolean;
  rejected?: boolean;
  duplicate?: boolean;
}

export const calculateLeaderboardPoints = (input: PointEventInput) => {
  if (input.rejected || input.duplicate) {
    return 0;
  }
  return (
    (input.completedEligibleRound ? 10 : 0) +
    (input.partnerVerified ? 8 : 0) +
    (input.matchPlayWin ? 12 : 0) +
    (input.personalBest ? 6 : 0) +
    (input.reliabilityMilestone ? 4 : 0)
  );
};
