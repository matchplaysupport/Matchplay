import type { OpenGame } from "@/types/domain";

export type JoinGameResult =
  | { status: "joined"; game: OpenGame }
  | { status: "waitlisted"; game: OpenGame }
  | { status: "already_member"; game: OpenGame };

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
