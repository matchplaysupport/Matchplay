import type {
  RegistrationPackage,
  Scramble,
  ScrambleAddOn,
  ScrambleContest,
  ScrambleFlight,
  ScrambleFormat,
  ScrambleScheduleItem,
  ScrambleSponsor,
  ScrambleStatus,
  ScrambleTeam,
  ScrambleType,
  SponsorTier,
} from "@/types/domain";

export function createScramble(params: {
  creatorId: string;
  type: ScrambleType;
  name: string;
  tagline?: string;
  description?: string;
  bannerColor?: string;
  organizerName: string;
  organizerContact?: string;
  organizerWebsite?: string;
  charityName?: string;
  charityMission?: string;
  charityEin?: string;
  fundraisingGoalCents?: number;
  courseName?: string;
  courseAddress?: string;
  date: string;
  checkInTime?: string;
  shotgunTime?: string;
  estimatedEndTime?: string;
  format: ScrambleFormat;
  holes: 9 | 18;
  teamSize: 2 | 3 | 4;
  maxTeams: number;
  isShotgunStart: boolean;
  mullligansAllowed: boolean;
  maxMulligansPerTeam?: number;
  flights: ScrambleFlight[];
  schedule: ScrambleScheduleItem[];
  contests: ScrambleContest[];
  sponsors: ScrambleSponsor[];
  packages: RegistrationPackage[];
  addOns: ScrambleAddOn[];
}): Scramble {
  return {
    id: `scramble-${Date.now()}`,
    status: "open",
    teams: [],
    createdAt: new Date().toISOString(),
    ...params,
  };
}

export function registerTeam(
  scramble: Scramble,
  team: Omit<ScrambleTeam, "id" | "registeredAt">,
): Scramble {
  const pkg = scramble.packages.find((p) => p.id === team.packageId);
  const newTeam: ScrambleTeam = {
    ...team,
    id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    registeredAt: new Date().toISOString(),
  };
  const updatedPackages = scramble.packages.map((p) =>
    p.id === team.packageId ? { ...p, spotsTaken: p.spotsTaken + 1 } : p,
  );
  return { ...scramble, teams: [...scramble.teams, newTeam], packages: updatedPackages };
}

export function markTeamPaid(scramble: Scramble, teamId: string): Scramble {
  return {
    ...scramble,
    teams: scramble.teams.map((t) =>
      t.id === teamId ? { ...t, paymentStatus: "paid" } : t,
    ),
  };
}

export function totalRegistered(scramble: Scramble): number {
  return scramble.teams.length;
}

export function totalRaisedCents(scramble: Scramble): number {
  return scramble.teams
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + t.totalPaidCents, 0);
}

export function spotsRemaining(scramble: Scramble): number {
  return scramble.maxTeams - scramble.teams.length;
}

export function formatScrambleType(type: ScrambleType): string {
  const labels: Record<ScrambleType, string> = {
    private: "Private",
    course: "Course Event",
    charity: "Charity",
    corporate: "Corporate",
  };
  return labels[type];
}

export function formatScrambleFormat(format: ScrambleFormat): string {
  const labels: Record<ScrambleFormat, string> = {
    captains_choice: "Captain's Choice",
    modified_scramble: "Modified Scramble",
    best_ball: "Best Ball",
    ambrose: "Ambrose",
  };
  return labels[format];
}

export function formatSponsorTier(tier: SponsorTier): string {
  const labels: Record<SponsorTier, string> = {
    title: "Title Sponsor",
    gold: "Gold Sponsor",
    silver: "Silver Sponsor",
    bronze: "Bronze Sponsor",
    hole: "Hole Sponsor",
    media: "Media Sponsor",
  };
  return labels[tier];
}

export function sponsorTierColor(tier: SponsorTier): string {
  const colors: Record<SponsorTier, string> = {
    title: "#7A3B8A",
    gold: "#C8981E",
    silver: "#8090A0",
    bronze: "#B06030",
    hole: "#1A6B40",
    media: "#2C5F8A",
  };
  return colors[tier];
}

export function contestTypeLabel(type: ScrambleContest["type"]): string {
  const labels: Record<ScrambleContest["type"], string> = {
    closest_to_pin: "Closest to the Pin",
    longest_drive: "Longest Drive",
    hole_in_one: "Hole-in-One Prize",
    putting: "Putting Contest",
    skins: "Skins Game",
  };
  return labels[type];
}

export function contestTypeIcon(type: ScrambleContest["type"]): string {
  const icons: Record<ScrambleContest["type"], string> = {
    closest_to_pin: "flag",
    longest_drive: "arrow-forward",
    hole_in_one: "star",
    putting: "golf",
    skins: "trophy",
  };
  return icons[type];
}

export function defaultSchedule(
  checkInTime = "7:00 AM",
  shotgunTime = "8:00 AM",
): ScrambleScheduleItem[] {
  return [
    { time: checkInTime, label: "Registration & Breakfast", icon: "sunny-outline" },
    { time: shotgunTime, label: "Shotgun Start", icon: "golf-outline" },
    { time: "12:00 PM", label: "Lunch & Scoring", icon: "restaurant-outline" },
    { time: "1:30 PM", label: "Awards Ceremony", icon: "trophy-outline" },
  ];
}

export function defaultPackages(teamSize: number): RegistrationPackage[] {
  return [
    {
      id: "pkg-player",
      name: "Player Entry",
      priceCents: 10000,
      includes: ["Green fees", "Cart share", "Lunch"],
      spotsTaken: 0,
    },
    {
      id: "pkg-team",
      name: `Team of ${teamSize}`,
      priceCents: 10000 * teamSize,
      includes: ["Green fees", "Cart", "Lunch", `Entry for ${teamSize} players`],
      spotsTaken: 0,
    },
  ];
}

export function defaultAddOns(): ScrambleAddOn[] {
  return [
    { id: "addon-mulligan", label: "Mulligan Pack (3)", priceCents: 1500, maxPerTeam: 2 },
    { id: "addon-raffle", label: "Raffle Tickets (5)", priceCents: 2000 },
    { id: "addon-dinner", label: "Dinner Ticket", priceCents: 5000 },
  ];
}

export function typeAccentColor(type: ScrambleType): string {
  const colors: Record<ScrambleType, string> = {
    private: "#7A3B8A",
    course: "#1A6B40",
    charity: "#C8981E",
    corporate: "#2C5F8A",
  };
  return colors[type];
}
