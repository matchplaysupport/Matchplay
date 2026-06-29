import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoProfiles } from "@/features/courses/demoData";
import type {
  ActiveRoundState,
  Booking,
  Course,
  HoleScore,
  Message,
  OpenGame,
  Profile,
  Round,
  Scramble,
  Tournament,
  TractionMetrics,
} from "@/types/domain";

const initialMetrics: TractionMetrics = {
  onboardingCompletions: 0,
  searches: 0,
  bookingRequests: 0,
  interestedActions: 0,
  passActions: 0,
  openGameCreations: 0,
  joinRequests: 0,
  roundsSubmitted: 0,
  messagesSent: 0,
  returningSessions: 0,
};

interface AppState {
  // Auth
  profile: Profile | null;
  isOnboarded: boolean;
  /** Supabase auth user id — null when using mock auth */
  authUserId: string | null;
  /** True once zustand has finished rehydrating from AsyncStorage */
  _hasHydrated: boolean;
  /** Dev toggle: layer demo golfers + open games on top of live data */
  demoMode: boolean;

  // Data
  bookings: Booking[];
  rounds: Round[];
  openGames: OpenGame[];
  messages: Message[];
  tournaments: Tournament[];
  scrambles: Scramble[];
  metrics: TractionMetrics;

  // Active scoring session (survives app restarts)
  activeRound: ActiveRoundState | null;
  activeCourse: Course | null;

  // Auth actions
  /** Mock sign-in for local dev (EXPO_PUBLIC_USE_MOCK_AUTH=true) */
  signIn(email: string): void;
  /** Called by root layout after Supabase auth resolves a session */
  setAuthSession(authUserId: string, profile: Profile | null): void;
  /** Called after onboarding writes profile to DB */
  completeOnboarding(profile: Profile): void;
  logout(): void;

  // Data actions
  addBooking(booking: Booking): void;
  saveRound(round: Round): void;
  addOpenGame(game: OpenGame): void;
  updateOpenGame(game: OpenGame): void;
  setOpenGames(games: OpenGame[]): void;
  addMessage(message: Message): void;
  addTournament(tournament: Tournament): void;
  updateTournament(tournament: Tournament): void;
  addScramble(scramble: Scramble): void;
  updateScramble(scramble: Scramble): void;
  recordMetric(metric: keyof TractionMetrics): void;
  updateProfile(profile: Profile): void;
  setDemoMode(value: boolean): void;

  // Scoring actions
  startRound(state: ActiveRoundState, course: Course): void;
  scoreHole(holeNumber: number, score: HoleScore): void;
  advanceHole(holeNumber: number): void;
  abandonRound(): void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      isOnboarded: false,
      authUserId: null,
      _hasHydrated: false,
      demoMode: false,
      bookings: [],
      rounds: [],
      openGames: [],
      messages: [],
      tournaments: [],
      scrambles: [],
      metrics: initialMetrics,
      activeRound: null,
      activeCourse: null,

      // ── Mock auth (dev only) ─────────────────────────────────────────────────
      signIn: (email) => {
        const demoProfile = demoProfiles[0];
        if (!demoProfile) throw new Error("Missing demo profile");
        set({
          profile: {
            ...demoProfile,
            id: `local-${email}`,
            username: email.split("@")[0] ?? "golfer",
          },
          isOnboarded: true,
          authUserId: null,
        });
      },

      // ── Real auth ────────────────────────────────────────────────────────────
      setAuthSession: (authUserId, profile) =>
        set({
          authUserId,
          profile,
          // Mark onboarded if we found an existing profile in the DB
          isOnboarded: profile !== null,
        }),

      completeOnboarding: (profile) =>
        set((state) => ({
          profile,
          isOnboarded: true,
          metrics: {
            ...state.metrics,
            onboardingCompletions: state.metrics.onboardingCompletions + 1,
          },
        })),

      logout: () =>
        set({
          profile: null,
          isOnboarded: false,
          authUserId: null,
          activeRound: null,
          bookings: [],
        }),

      // ── Data ─────────────────────────────────────────────────────────────────
      addBooking: (booking) =>
        set((state) => ({ bookings: [booking, ...state.bookings] })),

      saveRound: (round) =>
        set((state) => ({
          rounds: [round, ...state.rounds.filter((r) => r.id !== round.id)],
        })),

      addOpenGame: (game) =>
        set((state) => ({ openGames: [game, ...state.openGames] })),

      updateOpenGame: (game) =>
        set((state) => ({
          openGames: state.openGames.map((g) => (g.id === game.id ? game : g)),
        })),

      setOpenGames: (games) => set({ openGames: games }),

      addMessage: (message) =>
        set((state) => ({ messages: [message, ...state.messages] })),

      addTournament: (tournament) =>
        set((state) => ({ tournaments: [tournament, ...state.tournaments] })),

      updateTournament: (tournament) =>
        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournament.id ? tournament : t,
          ),
        })),

      addScramble: (scramble) =>
        set((state) => ({ scrambles: [scramble, ...state.scrambles] })),

      updateScramble: (scramble) =>
        set((state) => ({
          scrambles: state.scrambles.map((s) =>
            s.id === scramble.id ? scramble : s,
          ),
        })),

      recordMetric: (metric) =>
        set((state) => ({
          metrics: { ...state.metrics, [metric]: state.metrics[metric] + 1 },
        })),

      updateProfile: (profile) => set({ profile }),

      setDemoMode: (value) => set({ demoMode: value }),

      // ── Scoring ──────────────────────────────────────────────────────────────
      startRound: (state, course) => set({ activeRound: state, activeCourse: course }),

      scoreHole: (holeNumber, score) =>
        set((state) => {
          if (!state.activeRound) return {};
          const filtered = state.activeRound.scores.filter(
            (s) => s.holeNumber !== holeNumber,
          );
          return {
            activeRound: {
              ...state.activeRound,
              scores: [...filtered, score].sort((a, b) => a.holeNumber - b.holeNumber),
            },
          };
        }),

      advanceHole: (holeNumber) =>
        set((state) => {
          if (!state.activeRound) return {};
          return { activeRound: { ...state.activeRound, currentHole: holeNumber } };
        }),

      abandonRound: () => set({ activeRound: null, activeCourse: null }),
    }),
    {
      name: "match-play-app-v3",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    },
  ),
);
