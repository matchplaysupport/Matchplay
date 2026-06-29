import type {
  Course,
  DiscoveryProfile,
  EventParticipant,
  LeaderboardEntry,
  LiveEvent,
  LiveScore,
  Message,
  OpenGame,
  Profile,
  TeeTime,
} from "@/types/domain";

// ─── Holes factory ────────────────────────────────────────────────────────────

const PAR_SEQUENCE = [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4] as const;

const makeHoles = (teeSetIds: string[], nineHole = false) =>
  Array.from({ length: nineHole ? 9 : 18 }, (_, index) => {
    const number = index + 1;
    const par = PAR_SEQUENCE[index] ?? 4;
    return {
      number,
      par,
      handicap: ((index * 7) % 18) + 1,
      yardsByTeeSet: Object.fromEntries(
        teeSetIds.map((id, teeIndex) => [
          id,
          par * 90 + teeIndex * 40 + ((index % 4) * 15),
        ]),
      ),
    };
  });

// ─── Courses ──────────────────────────────────────────────────────────────────

export const demoCourses: Course[] = [
  {
    id: "course-riverbend",
    name: "Riverbend Commons",
    facilityName: "Riverbend Golf Collective",
    city: "Nashville",
    state: "TN",
    zipCode: "37212",
    coordinates: { latitude: 36.141, longitude: -86.812 },
    teeSets: [
      { id: "riverbend-spruce", name: "Spruce", color: "#2A7040", rating: 70.8, slope: 128, par: 72, yardage: 6420 },
      { id: "riverbend-silver", name: "Silver", color: "#A0A8A0", rating: 68.2, slope: 119, par: 72, yardage: 5880 },
      { id: "riverbend-junior", name: "Juniper", color: "#C0302A", rating: 65.4, slope: 110, par: 72, yardage: 5180 },
    ],
    holes: makeHoles(["riverbend-spruce", "riverbend-silver", "riverbend-junior"]),
    amenities: ["Driving range", "Putting green", "Walking friendly", "Clubhouse grill", "Pro shop"],
    demoData: true,
  },
  {
    id: "course-copper-hill",
    name: "Copper Hill Nine",
    facilityName: "Copper Hill Golf Yard",
    city: "Knoxville",
    state: "TN",
    zipCode: "37919",
    coordinates: { latitude: 35.934, longitude: -84.012 },
    teeSets: [
      { id: "copper-cedar", name: "Cedar", color: "#2060A8", rating: 34.5, slope: 116, par: 35, yardage: 3050 },
      { id: "copper-maple", name: "Maple", color: "#D0D0D0", rating: 32.8, slope: 108, par: 35, yardage: 2680 },
    ],
    holes: makeHoles(["copper-cedar", "copper-maple"], true),
    amenities: ["Short game area", "Lessons available", "Putting green"],
    demoData: true,
  },
  {
    id: "course-saguaro-run",
    name: "Saguaro Run",
    facilityName: "Saguaro Run Golf Club",
    city: "Scottsdale",
    state: "AZ",
    zipCode: "85255",
    coordinates: { latitude: 33.67, longitude: -111.89 },
    teeSets: [
      { id: "saguaro-gold", name: "Gold", color: "#C8981E", rating: 72.9, slope: 136, par: 72, yardage: 6810 },
      { id: "saguaro-copper", name: "Copper", color: "#B87030", rating: 69.7, slope: 124, par: 72, yardage: 6120 },
      { id: "saguaro-sand", name: "Sand", color: "#D0C090", rating: 67.1, slope: 115, par: 72, yardage: 5530 },
    ],
    holes: makeHoles(["saguaro-gold", "saguaro-copper", "saguaro-sand"]),
    amenities: ["Cart GPS", "Practice range", "Resort amenities", "Halfway house"],
    demoData: true,
  },
  {
    id: "course-lake-ash",
    name: "Lake Ash Municipal",
    facilityName: "Lake Ash Parks Golf",
    city: "Madison",
    state: "WI",
    zipCode: "53711",
    coordinates: { latitude: 43.04, longitude: -89.44 },
    teeSets: [
      { id: "lake-black", name: "Black", color: "#202020", rating: 71.5, slope: 131, par: 72, yardage: 6605 },
      { id: "lake-white", name: "White", color: "#E0E0E0", rating: 67.9, slope: 114, par: 72, yardage: 5740 },
    ],
    holes: makeHoles(["lake-black", "lake-white"]),
    amenities: ["Clubhouse", "Push carts", "Junior tees", "Snack bar"],
    demoData: true,
  },
  {
    id: "course-iron-ridge",
    name: "Iron Ridge Links",
    facilityName: "Iron Ridge Golf",
    city: "Brentwood",
    state: "TN",
    zipCode: "37027",
    coordinates: { latitude: 35.998, longitude: -86.783 },
    teeSets: [
      { id: "iron-championship", name: "Championship", color: "#202020", rating: 73.4, slope: 138, par: 72, yardage: 7020 },
      { id: "iron-blue", name: "Blue", color: "#2060A8", rating: 71.2, slope: 129, par: 72, yardage: 6580 },
      { id: "iron-white", name: "White", color: "#E0E0E0", rating: 68.9, slope: 120, par: 72, yardage: 6080 },
    ],
    holes: makeHoles(["iron-championship", "iron-blue", "iron-white"]),
    amenities: ["Full practice facility", "Golf academy", "Restaurant", "Pro shop", "Walking caddies"],
    demoData: true,
  },
  {
    id: "course-willowbrook",
    name: "Willowbrook Par 3",
    facilityName: "Willowbrook Golf Center",
    city: "Nashville",
    state: "TN",
    zipCode: "37207",
    coordinates: { latitude: 36.198, longitude: -86.745 },
    teeSets: [
      { id: "willow-standard", name: "Standard", color: "#E0E0E0", rating: 27.5, slope: 95, par: 27, yardage: 1680 },
    ],
    holes: makeHoles(["willow-standard"], true),
    amenities: ["Night golf lights", "Beginner-friendly", "Lessons"],
    demoData: true,
  },
];

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const demoProfiles: Profile[] = [
  {
    id: "user-demo-jackson",
    displayName: "Jackson Reed",
    username: "jreed",
    city: "Nashville",
    state: "TN",
    zipCode: "37212",
    skillLevel: "recreational",
    handicapSource: "match_play_estimate",
    handicapValue: 13.2,
    preferredRadiusMiles: 25,
    preferredGameStyle: "both",
    reliabilityLabel: "Reliable player",
    privacy: {
      hideExactAge: true,
      hideHandicap: false,
      hideRoundHistory: false,
      hideProfileDiscovery: false,
      hideApproximateLocation: false,
      hideLeaderboards: false,
    },
  },
  {
    id: "user-demo-maya",
    displayName: "Maya Brooks",
    username: "mbrooks",
    city: "Franklin",
    state: "TN",
    zipCode: "37064",
    skillLevel: "competitive",
    handicapSource: "official_unverified",
    handicapValue: 6.4,
    preferredRadiusMiles: 35,
    preferredGameStyle: "competitive",
    reliabilityLabel: "Highly reliable",
    privacy: {
      hideExactAge: true,
      hideHandicap: false,
      hideRoundHistory: false,
      hideProfileDiscovery: false,
      hideApproximateLocation: false,
      hideLeaderboards: false,
    },
  },
  {
    id: "user-demo-eli",
    displayName: "Eli Carter",
    username: "ecarter",
    city: "Nashville",
    state: "TN",
    zipCode: "37209",
    skillLevel: "casual",
    handicapSource: "match_play_estimate",
    handicapValue: 17.8,
    preferredRadiusMiles: 20,
    preferredGameStyle: "casual",
    reliabilityLabel: "Reliable player",
    privacy: {
      hideExactAge: true,
      hideHandicap: false,
      hideRoundHistory: false,
      hideProfileDiscovery: false,
      hideApproximateLocation: false,
      hideLeaderboards: false,
    },
  },
  {
    id: "user-demo-priya",
    displayName: "Priya Nair",
    username: "pnair",
    city: "Brentwood",
    state: "TN",
    zipCode: "37027",
    skillLevel: "recreational",
    handicapSource: "match_play_estimate",
    handicapValue: 22.1,
    preferredRadiusMiles: 30,
    preferredGameStyle: "casual",
    reliabilityLabel: "New player",
    privacy: {
      hideExactAge: false,
      hideHandicap: false,
      hideRoundHistory: false,
      hideProfileDiscovery: false,
      hideApproximateLocation: false,
      hideLeaderboards: false,
    },
  },
  {
    id: "user-demo-marco",
    displayName: "Marco Delgado",
    username: "mdelgado",
    city: "Nashville",
    state: "TN",
    zipCode: "37210",
    skillLevel: "competitive",
    handicapSource: "official_unverified",
    handicapValue: 3.8,
    preferredRadiusMiles: 40,
    preferredGameStyle: "competitive",
    reliabilityLabel: "Highly reliable",
    privacy: {
      hideExactAge: true,
      hideHandicap: false,
      hideRoundHistory: false,
      hideProfileDiscovery: false,
      hideApproximateLocation: false,
      hideLeaderboards: false,
    },
  },
  {
    id: "user-demo-sarah",
    displayName: "Sarah Whitfield",
    username: "swhitfield",
    city: "Nashville",
    state: "TN",
    zipCode: "37203",
    skillLevel: "recreational",
    handicapSource: "match_play_estimate",
    handicapValue: 15.6,
    preferredRadiusMiles: 25,
    preferredGameStyle: "both",
    reliabilityLabel: "Reliable player",
    privacy: {
      hideExactAge: true,
      hideHandicap: false,
      hideRoundHistory: false,
      hideProfileDiscovery: false,
      hideApproximateLocation: false,
      hideLeaderboards: false,
    },
  },
];

// ─── Discovery profiles ───────────────────────────────────────────────────────

export const discoveryProfiles: DiscoveryProfile[] = [
  {
    id: "user-demo-maya",
    displayName: "Maya Brooks",
    approximateLocation: "Franklin, TN",
    distanceMiles: 14,
    skillLevel: "competitive",
    handicapValue: 6.4,
    handicapSource: "official_unverified",
    preferredGameStyle: "competitive",
    reliabilityLabel: "Highly reliable",
    bio: "Scratch competitor looking for serious match-play partners. Former collegiate golfer.",
    tags: ["Match play", "18 holes", "Weekend mornings", "Cart"],
    roundsPlayed: 48,
    matchPlayRecord: { wins: 22, losses: 8 },
  },
  {
    id: "user-demo-marco",
    displayName: "Marco Delgado",
    approximateLocation: "Nashville, TN",
    distanceMiles: 4,
    skillLevel: "competitive",
    handicapValue: 3.8,
    handicapSource: "official_unverified",
    preferredGameStyle: "competitive",
    reliabilityLabel: "Highly reliable",
    bio: "Low handicapper who loves Nassau and skins. Looking for partners who play fast.",
    tags: ["Competitive", "Low handicap", "Any tees", "Walking"],
    roundsPlayed: 62,
    matchPlayRecord: { wins: 31, losses: 12 },
  },
  {
    id: "user-demo-eli",
    displayName: "Eli Carter",
    approximateLocation: "Nashville, TN",
    distanceMiles: 6,
    skillLevel: "casual",
    handicapValue: 17.8,
    handicapSource: "match_play_estimate",
    preferredGameStyle: "casual",
    reliabilityLabel: "Reliable player",
    bio: "Weekend golfer, beer cart enthusiast. I'm here for the vibe, not the score.",
    tags: ["Casual", "18 holes", "Cart", "Weekend"],
    roundsPlayed: 19,
    matchPlayRecord: { wins: 4, losses: 9 },
  },
  {
    id: "user-demo-priya",
    displayName: "Priya Nair",
    approximateLocation: "Brentwood, TN",
    distanceMiles: 18,
    skillLevel: "recreational",
    handicapValue: 22.1,
    handicapSource: "match_play_estimate",
    preferredGameStyle: "casual",
    reliabilityLabel: "New player",
    bio: "Learning the game. Looking for patient partners and relaxed weekend rounds.",
    tags: ["New golfer", "9 holes ok", "Walking", "Relaxed pace"],
    roundsPlayed: 7,
    matchPlayRecord: { wins: 1, losses: 3 },
  },
  {
    id: "user-demo-sarah",
    displayName: "Sarah Whitfield",
    approximateLocation: "Nashville, TN",
    distanceMiles: 11,
    skillLevel: "recreational",
    handicapValue: 15.6,
    handicapSource: "match_play_estimate",
    preferredGameStyle: "both",
    reliabilityLabel: "Reliable player",
    bio: "Mid-handicapper working on my iron game. Love a good Nassau with drinks after.",
    tags: ["Social", "18 holes", "Mixed formats", "Cart"],
    roundsPlayed: 28,
    matchPlayRecord: { wins: 9, losses: 11 },
  },
];

// ─── Tee times ────────────────────────────────────────────────────────────────

const BASE_DATE = new Date("2026-07-02T06:30:00.000Z");
const PRICES = [3200, 4500, 7800, 2900, 5500, 1800] as const;

export const demoTeeTimes: TeeTime[] = Array.from({ length: 32 }, (_, index) => {
  const course = demoCourses[index % demoCourses.length];
  if (!course) throw new Error("Demo course generation failed");
  const date = new Date(BASE_DATE);
  date.setMinutes(date.getMinutes() + index * 18);
  const basePrice = PRICES[index % PRICES.length] ?? 3200;
  return {
    id: `tee-${index + 1}`,
    courseId: course.id,
    startsAt: date.toISOString(),
    priceCents: basePrice + ((index % 3) * 400),
    availableSpots: ((index % 4) + 1) as 1 | 2 | 3 | 4,
    holes: course.holes.length <= 9 ? 9 : 18,
    cartIncluded: index % 3 !== 1,
    walkingAllowed: index % 3 !== 0,
    cancellationLabel: index % 2 === 0 ? "Cancel by 6 PM prior day" : "Flexible cancellation",
    demoInventory: true,
  };
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────

const MOVEMENTS = [3, -1, 2, 0, -2, 1] as const;

export const demoLeaderboard: LeaderboardEntry[] = demoProfiles.map((profile, index) => ({
  rank: index + 1,
  playerId: profile.id,
  displayName: profile.displayName,
  location: `${profile.city}, ${profile.state}`,
  metricLabel: profile.handicapValue
    ? `${profile.handicapValue.toFixed(1)} HCP`
    : "No handicap",
  points: 680 - index * 62,
  verified: profile.handicapSource === "official_unverified",
  movement: MOVEMENTS[index] ?? 0,
}));

// ─── Open games ───────────────────────────────────────────────────────────────

export const seededOpenGames: OpenGame[] = [
  {
    id: "game-riverbend-saturday",
    courseId: "course-riverbend",
    creatorId: "user-demo-maya",
    startsAt: "2026-07-05T14:10:00.000Z",
    availableSpots: 4,
    acceptedPlayerIds: ["user-demo-maya", "user-demo-eli"],
    waitlistedPlayerIds: [],
    approvalRequired: true,
    visibility: "public",
    description: "Match-play Nassau format. Relaxed pace, serious golf.",
    holes: 18,
    estimatedPriceCents: 4500,
    cartIncluded: true,
    handicapRangeMin: 0,
    handicapRangeMax: 20,
  },
  {
    id: "game-copper-hill-nine",
    courseId: "course-copper-hill",
    creatorId: "user-demo-eli",
    startsAt: "2026-07-06T20:30:00.000Z",
    availableSpots: 3,
    acceptedPlayerIds: ["user-demo-eli"],
    waitlistedPlayerIds: [],
    approvalRequired: false,
    visibility: "public",
    description: "Quick nine after work. Walking, no rush.",
    holes: 9,
    estimatedPriceCents: 2200,
    cartIncluded: false,
  },
  {
    id: "game-iron-ridge-comp",
    courseId: "course-iron-ridge",
    creatorId: "user-demo-marco",
    startsAt: "2026-07-07T09:00:00.000Z",
    availableSpots: 4,
    acceptedPlayerIds: ["user-demo-marco"],
    waitlistedPlayerIds: [],
    approvalRequired: true,
    visibility: "public",
    description: "Stroke play competitive round. Sub-18 HCP preferred.",
    holes: 18,
    estimatedPriceCents: 7500,
    cartIncluded: true,
    handicapRangeMin: 0,
    handicapRangeMax: 18,
  },
];

// ─── Messages ─────────────────────────────────────────────────────────────────

export const seededMessages: Message[] = [
  {
    id: "message-seed-1",
    conversationId: "game-riverbend-saturday",
    senderId: "user-demo-maya",
    body: "Saturday group is aiming for a relaxed match-play Nassau. Two spots open — bring your A-game.",
    createdAt: "2026-07-01T15:24:00.000Z",
    deliveryState: "sent",
  },
  {
    id: "message-seed-2",
    conversationId: "game-riverbend-saturday",
    senderId: "user-demo-eli",
    body: "I'm in. Should we set the press at 3 down or keep it simple?",
    createdAt: "2026-07-01T15:41:00.000Z",
    deliveryState: "sent",
  },
  {
    id: "message-seed-3",
    conversationId: "game-copper-hill-nine",
    senderId: "user-demo-eli",
    body: "Post-work nine at Copper Hill. Anyone in? Instant join, no approval needed.",
    createdAt: "2026-07-01T16:00:00.000Z",
    deliveryState: "sent",
  },
];

// ─── Live-scoring event (Phase A demo) ──────────────────────────────────────────
// Powers the SimulatedLiveScoringProvider so the group-scorer screen and the
// web scoreboard render without a backend (EXPO_PUBLIC_USE_MOCK_AUTH=true).

export const demoLiveEvent: LiveEvent = {
  id: "event-riverbend-junior",
  name: "Riverbend Junior Open",
  slug: "riverbend-junior-open",
  eventType: "junior",
  organizerId: "user-demo-maya",
  courseId: "course-riverbend",
  holes: 18,
  scoringMode: "group_scorer",
  status: "in_progress",
  publicScoreboard: true,
  freeForParticipants: true,
  startsAt: "2026-07-04T13:00:00.000Z",
};

/** The group the mock-signed-in user is assigned to score. */
export const demoScorerGroupNo = 1;

export const demoEventParticipants: EventParticipant[] = [
  { id: "ep-1", eventId: demoLiveEvent.id, displayName: "Avery Chen", groupNo: 1, startingHole: 1, status: "active" },
  { id: "ep-2", eventId: demoLiveEvent.id, displayName: "Mason Park", groupNo: 1, startingHole: 1, status: "active" },
  { id: "ep-3", eventId: demoLiveEvent.id, displayName: "Sofia Ruiz", groupNo: 1, startingHole: 1, status: "active" },
  { id: "ep-4", eventId: demoLiveEvent.id, displayName: "Liam Brooks", groupNo: 1, startingHole: 1, status: "active" },
  { id: "ep-5", eventId: demoLiveEvent.id, displayName: "Emma Davis", groupNo: 2, startingHole: 1, status: "active" },
  { id: "ep-6", eventId: demoLiveEvent.id, displayName: "Noah Kim", groupNo: 2, startingHole: 1, status: "active" },
  { id: "ep-7", eventId: demoLiveEvent.id, displayName: "Olivia Tran", groupNo: 2, startingHole: 1, status: "active" },
  { id: "ep-8", eventId: demoLiveEvent.id, displayName: "Ethan Cole", groupNo: 2, startingHole: 1, status: "active" },
];

const demoScoreLines: [string, number[]][] = [
  ["ep-1", [4, 4, 3, 4, 3]],
  ["ep-2", [5, 5, 4, 4, 4]],
  ["ep-3", [4, 6, 3, 5, 4]],
  ["ep-4", [4, 5, 2, 4, 4]],
  ["ep-5", [3, 5, 3]],
  ["ep-6", [5, 6, 4]],
  ["ep-7", [4, 4, 3]],
  ["ep-8", [4, 5, 3]],
];

export const demoLiveScores: LiveScore[] = demoScoreLines.flatMap(([participantId, strokes]) =>
  strokes.map((s, i) => ({ participantId, holeNumber: i + 1, strokes: s })),
);
