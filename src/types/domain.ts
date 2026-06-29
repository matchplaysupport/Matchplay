export type SkillLevel = "new" | "casual" | "recreational" | "competitive" | "elite";
export type HandicapSource = "official_unverified" | "match_play_estimate" | "none";
export type RoundFormat = "stroke_play" | "match_play" | "stableford" | "practice";
export type VerificationState =
  | "draft"
  | "submitted"
  | "self_reported"
  | "partner_verified"
  | "organizer_verified"
  | "official_provider_verified"
  | "disputed"
  | "rejected";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Profile {
  id: string;
  displayName: string;
  username: string;
  city: string;
  state: string;
  zipCode: string;
  skillLevel: SkillLevel;
  handicapSource: HandicapSource;
  handicapValue?: number;
  preferredRadiusMiles: number;
  preferredGameStyle: "casual" | "competitive" | "both";
  privacy: PrivacySettings;
  reliabilityLabel: "New player" | "Reliable player" | "Highly reliable";
}

export interface PrivacySettings {
  hideExactAge: boolean;
  hideHandicap: boolean;
  hideRoundHistory: boolean;
  hideProfileDiscovery: boolean;
  hideApproximateLocation: boolean;
  hideLeaderboards: boolean;
}

export interface TeeSet {
  id: string;
  name: string;
  color: string;
  rating: number;
  slope: number;
  par: number;
  yardage: number;
}

export interface Hole {
  number: number;
  par: number;
  handicap: number;
  yardsByTeeSet: Record<string, number>;
}

export interface Course {
  id: string;
  name: string;
  facilityName: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: Coordinates;
  holes: Hole[];
  teeSets: TeeSet[];
  amenities: string[];
  demoData?: true;
  /** Numeric ID from GolfCourseAPI, present on real courses */
  externalId?: number;
}

/** Minimal course fields needed to render a tee-time card without a full Course. */
export interface CourseSummary {
  id: string;
  name: string;
  facilityName: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface TeeTime {
  id: string;
  courseId: string;
  startsAt: string;
  priceCents: number;
  availableSpots: number;
  holes: 9 | 18;
  cartIncluded: boolean;
  walkingAllowed: boolean;
  cancellationLabel: string;
  demoInventory?: true;
  /** Embedded by providers so list/detail screens don't depend on demo data. */
  course?: CourseSummary;
}

export interface Booking {
  id: string;
  teeTimeId: string;
  courseId: string;
  confirmationCode: string;
  players: number;
  communitySpots: number;
  createdAt: string;
  status?: "requested" | "confirmed" | "fulfilled";
  source?: "concierge" | "operator";
  fulfillmentLabel?: string;
}

export interface HoleScore {
  holeNumber: number;
  grossScore: number;
  putts: number;
  fairway: "hit" | "miss_left" | "miss_right" | "miss_short" | "miss_long" | "not_applicable";
  greenInRegulation: boolean;
  penaltyStrokes: number;
  sandSaveOpportunity: boolean;
  sandSaveMade: boolean;
  upAndDownOpportunity: boolean;
  upAndDownMade: boolean;
  teeShotClub?: string;
  driveDistanceYards?: number;
  notes?: string;
}

export interface Round {
  id: string;
  courseId: string;
  teeSetId: string;
  format: RoundFormat;
  holes: 9 | 18;
  scores: HoleScore[];
  verificationState: VerificationState;
  startedAt: string;
  submittedAt?: string;
}

export interface OpenGame {
  id: string;
  courseId: string;
  creatorId: string;
  startsAt: string;
  availableSpots: number;
  acceptedPlayerIds: string[];
  waitlistedPlayerIds: string[];
  approvalRequired: boolean;
  visibility: "public" | "friends" | "invite_only";
  description?: string;
  holes?: 9 | 18;
  estimatedPriceCents?: number;
  cartIncluded?: boolean;
  handicapRangeMin?: number;
  handicapRangeMax?: number;
  /** Populated by the live provider (joined). Absent on locally-created games. */
  course?: CourseSummary;
  creatorName?: string;
}

export interface DiscoveryProfile {
  id: string;
  displayName: string;
  approximateLocation: string;
  distanceMiles: number;
  skillLevel: SkillLevel;
  handicapValue?: number;
  handicapSource: HandicapSource;
  preferredGameStyle: "casual" | "competitive" | "both";
  reliabilityLabel: "New player" | "Reliable player" | "Highly reliable";
  bio?: string;
  tags: string[];
  roundsPlayed: number;
  matchPlayRecord: { wins: number; losses: number };
}

export interface ActiveRoundState {
  roundId: string;
  courseId: string;
  teeSetId: string;
  format: RoundFormat;
  holes: 9 | 18;
  currentHole: number;
  scores: HoleScore[];
  startedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  deliveryState: "sending" | "sent" | "failed";
}

export interface TractionMetrics {
  onboardingCompletions: number;
  searches: number;
  bookingRequests: number;
  interestedActions: number;
  passActions: number;
  openGameCreations: number;
  joinRequests: number;
  roundsSubmitted: number;
  messagesSent: number;
  returningSessions: number;
}

// ─── Scramble (full event platform) ──────────────────────────────────────────

export type ScrambleType = "private" | "course" | "charity" | "corporate";
export type ScrambleFormat = "captains_choice" | "modified_scramble" | "best_ball" | "ambrose";
export type SponsorTier = "title" | "gold" | "silver" | "bronze" | "hole" | "media";
export type ScrambleStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled";

export interface ScrambleSponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  holeNumber?: number;
  website?: string;
}

export interface ScrambleContest {
  id: string;
  type: "closest_to_pin" | "longest_drive" | "hole_in_one" | "putting" | "skins";
  holeNumber?: number;
  prize: string;
  prizeCents?: number;
}

export interface RegistrationPackage {
  id: string;
  name: string;
  priceCents: number;
  includes: string[];
  description?: string;
  spotsTotal?: number;
  spotsTaken: number;
}

export interface ScrambleAddOn {
  id: string;
  label: string;
  priceCents: number;
  maxPerTeam?: number;
}

export interface ScrambleScheduleItem {
  time: string;
  label: string;
  icon?: string;
}

export interface ScrambleFlight {
  id: string;
  name: string;
  handicapMax?: number;
  description?: string;
}

export interface ScrambleTeamPlayer {
  name: string;
  handicap?: number;
}

export interface ScrambleTeam {
  id: string;
  teamName: string;
  players: ScrambleTeamPlayer[];
  flightId?: string;
  packageId: string;
  addOns: { addOnId: string; quantity: number }[];
  paymentStatus: "registered" | "paid" | "partial";
  totalPaidCents: number;
  registeredAt: string;
  notes?: string;
}

export interface Scramble {
  id: string;
  creatorId: string;
  type: ScrambleType;
  status: ScrambleStatus;

  // Identity
  name: string;
  tagline?: string;
  description?: string;
  bannerColor?: string;

  // Organizer
  organizerName: string;
  organizerContact?: string;
  organizerWebsite?: string;

  // Charity
  charityName?: string;
  charityMission?: string;
  charityEin?: string;
  fundraisingGoalCents?: number;

  // Location & timing
  courseName?: string;
  courseAddress?: string;
  date: string;
  checkInTime?: string;
  shotgunTime?: string;
  estimatedEndTime?: string;

  // Format
  format: ScrambleFormat;
  holes: 9 | 18;
  teamSize: 2 | 3 | 4;
  maxTeams: number;
  isShotgunStart: boolean;
  mullligansAllowed: boolean;
  maxMulligansPerTeam?: number;

  // Structure
  flights: ScrambleFlight[];
  schedule: ScrambleScheduleItem[];
  contests: ScrambleContest[];
  sponsors: ScrambleSponsor[];
  packages: RegistrationPackage[];
  addOns: ScrambleAddOn[];

  // Teams
  teams: ScrambleTeam[];

  createdAt: string;
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export type TournamentFormat = "stroke_play" | "match_play" | "stableford" | "scramble";
export type TournamentStatus = "open" | "in_progress" | "completed" | "cancelled";
export type PrizeDistribution = "winner_takes_all" | "top3_split" | "no_prize";
export type PlayerPaymentStatus = "registered" | "paid" | "withdrawn";

export interface Tournament {
  id: string;
  name: string;
  courseId?: string;
  courseName?: string;
  creatorId: string;
  startsAt: string;
  format: TournamentFormat;
  holes: 9 | 18;
  maxPlayers: number;
  buyInCents: number;
  prizeDistribution: PrizeDistribution;
  status: TournamentStatus;
  description?: string;
  players: TournamentPlayer[];
  createdAt: string;
}

export interface TournamentPlayer {
  playerId: string;
  displayName: string;
  paymentStatus: PlayerPaymentStatus;
  finalPosition?: number;
  payoutCents?: number;
  joinedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  location: string;
  metricLabel: string;
  points: number;
  verified: boolean;
  movement: number;
}

// ─── Live-scoring events (Phase A) ─────────────────────────────────────────────

export type EventType = "junior" | "college" | "scramble" | "open" | "course";
export type EventScoringMode = "group_scorer" | "self";
export type LiveEventStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface LiveEvent {
  id: string;
  name: string;
  slug: string;
  eventType: EventType;
  organizerId: string;
  courseId?: string;
  teeSetId?: string;
  holes: 9 | 18;
  scoringMode: EventScoringMode;
  status: LiveEventStatus;
  publicScoreboard: boolean;
  freeForParticipants: boolean;
  startsAt?: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  /** Set only if the participant has an app account; juniors usually won't. */
  profileId?: string;
  displayName: string;
  groupNo?: number;
  startingHole: number;
  teeSetId?: string;
  status: "active" | "withdrawn" | "disqualified";
}

export interface EventScorer {
  id: string;
  eventId: string;
  profileId: string;
  /** null = may score the whole event (e.g. organizer). */
  groupNo?: number;
}

export interface LiveScore {
  participantId: string;
  holeNumber: number;
  strokes: number;
  enteredBy?: string;
  updatedAt?: string;
}

/** Derived standings row, computed from participants + live scores + hole pars. */
export interface ScoreboardRow {
  participantId: string;
  displayName: string;
  groupNo?: number;
  /** Strokes relative to par over completed holes. */
  toPar: number;
  /** Number of holes completed. */
  thru: number;
  /** Gross strokes over completed holes. */
  grossStrokes: number;
  /** 1-based position; ties share a position. */
  position: number;
}
