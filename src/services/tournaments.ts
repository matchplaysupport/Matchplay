import type { PrizeDistribution, Tournament, TournamentFormat, TournamentPlayer } from "@/types/domain";

export function createTournament(params: {
  name: string;
  courseId?: string;
  courseName?: string;
  creatorId: string;
  creatorDisplayName: string;
  startsAt: string;
  format: TournamentFormat;
  holes: 9 | 18;
  maxPlayers: number;
  buyInCents: number;
  prizeDistribution: PrizeDistribution;
  description?: string;
}): Tournament {
  const creator: TournamentPlayer = {
    playerId: params.creatorId,
    displayName: params.creatorDisplayName,
    paymentStatus: "paid",
    joinedAt: new Date().toISOString(),
  };
  return {
    id: `tournament-${Date.now()}`,
    name: params.name,
    courseId: params.courseId,
    courseName: params.courseName,
    creatorId: params.creatorId,
    startsAt: params.startsAt,
    format: params.format,
    holes: params.holes,
    maxPlayers: params.maxPlayers,
    buyInCents: params.buyInCents,
    prizeDistribution: params.prizeDistribution,
    status: "open",
    description: params.description,
    players: [creator],
    createdAt: new Date().toISOString(),
  };
}

export function joinTournament(tournament: Tournament, playerId: string, displayName: string): Tournament {
  if (tournament.players.some((p) => p.playerId === playerId)) return tournament;
  const player: TournamentPlayer = {
    playerId,
    displayName,
    paymentStatus: "registered",
    joinedAt: new Date().toISOString(),
  };
  return { ...tournament, players: [...tournament.players, player] };
}

export function markPlayerPaid(tournament: Tournament, playerId: string): Tournament {
  return {
    ...tournament,
    players: tournament.players.map((p) =>
      p.playerId === playerId ? { ...p, paymentStatus: "paid" } : p,
    ),
  };
}

export function completeTournament(
  tournament: Tournament,
  finalPositions: { playerId: string; position: number }[],
): Tournament {
  const prizePoolCents = tournament.buyInCents * tournament.players.filter((p) => p.paymentStatus === "paid").length;
  const payouts = calculatePayouts(prizePoolCents, finalPositions.length, tournament.prizeDistribution);

  const players = tournament.players.map((p) => {
    const pos = finalPositions.find((f) => f.playerId === p.playerId);
    return {
      ...p,
      finalPosition: pos?.position,
      payoutCents: pos ? (payouts[pos.position - 1] ?? 0) : 0,
    };
  });

  return { ...tournament, status: "completed", players };
}

function calculatePayouts(
  prizePoolCents: number,
  _playerCount: number,
  distribution: PrizeDistribution,
): number[] {
  if (distribution === "no_prize" || prizePoolCents === 0) return [];
  if (distribution === "winner_takes_all") return [prizePoolCents];
  // top3_split: 50 / 30 / 20
  return [
    Math.round(prizePoolCents * 0.5),
    Math.round(prizePoolCents * 0.3),
    Math.round(prizePoolCents * 0.2),
  ];
}

export function formatFormatLabel(format: TournamentFormat): string {
  const labels: Record<TournamentFormat, string> = {
    stroke_play: "Stroke Play",
    match_play: "Match Play",
    stableford: "Stableford",
    scramble: "Scramble",
  };
  return labels[format];
}

export function formatPrizeDistributionLabel(dist: PrizeDistribution): string {
  const labels: Record<PrizeDistribution, string> = {
    winner_takes_all: "Winner takes all",
    top3_split: "Top 3 split (50/30/20)",
    no_prize: "No prize",
  };
  return labels[dist];
}

export function prizePoolCents(tournament: Tournament): number {
  return tournament.buyInCents * tournament.players.filter((p) => p.paymentStatus === "paid").length;
}
