export const calculatePlayingHandicap = (handicapIndex: number, slope: number, rating: number, par: number) =>
  Math.round(handicapIndex * (slope / 113) + (rating - par));

export const allocateMatchStrokes = (playerHandicap: number, opponentHandicap: number, holeHandicaps: number[]) => {
  const difference = Math.max(0, Math.round(playerHandicap - opponentHandicap));
  return holeHandicaps.map((holeHandicap) => Math.floor(difference / 18) + (holeHandicap <= difference % 18 ? 1 : 0));
};

export const formatMatchResult = (holesWon: number, holesRemaining: number) => {
  if (holesWon <= 0 || holesWon <= holesRemaining) {
    return "All square";
  }
  return `${holesWon} & ${holesRemaining}`;
};
