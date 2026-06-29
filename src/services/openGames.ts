import type { OpenGame } from "@/types/domain";

export type JoinStatus = "joined" | "waitlisted" | "already_member";

export type JoinGameResult =
  | { status: "joined"; game: OpenGame }
  | { status: "waitlisted"; game: OpenGame }
  | { status: "already_member"; game: OpenGame };

/**
 * Live join — delegates to the `join_open_game` edge function, which enforces
 * capacity server-side (atomic accept-vs-waitlist). Use this in live mode;
 * the pure `joinOpenGame` below is the optimistic/mock-mode equivalent.
 *
 * Supabase is imported lazily so this module stays side-effect-free for unit
 * tests (the client sets up an auth-refresh timer at construction).
 */
export async function requestJoinOpenGame(openGameId: string): Promise<JoinStatus> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase.functions.invoke<{ status?: JoinStatus; error?: string }>(
    "join_open_game",
    { body: { openGameId } },
  );
  if (error) throw error;
  if (!data?.status) throw new Error(data?.error ?? "Could not join this game.");
  return data.status;
}

export const joinOpenGame = (game: OpenGame, userId: string): JoinGameResult => {
  if (game.acceptedPlayerIds.includes(userId) || game.waitlistedPlayerIds.includes(userId)) {
    return { status: "already_member", game };
  }
  if (game.acceptedPlayerIds.length < game.availableSpots && !game.approvalRequired) {
    return {
      status: "joined",
      game: { ...game, acceptedPlayerIds: [...game.acceptedPlayerIds, userId] },
    };
  }
  return {
    status: "waitlisted",
    game: { ...game, waitlistedPlayerIds: [...game.waitlistedPlayerIds, userId] },
  };
};
