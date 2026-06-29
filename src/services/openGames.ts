import type { CourseSummary, OpenGame } from "@/types/domain";

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

export type CreateOpenGameInput = {
  course: CourseSummary;
  startsAt: string;
  availableSpots: number;
  approvalRequired: boolean;
  holes?: 9 | 18;
  estimatedPriceCents?: number;
  cartIncluded?: boolean;
  description?: string;
};

/** Create an open game in Supabase, hosted by the signed-in golfer. */
export async function createOpenGame(input: CreateOpenGameInput): Promise<OpenGame> {
  const { supabase } = await import("@/lib/supabase");
  const { data: sessionData } = await supabase.auth.getSession();
  const authUserId = sessionData.session?.user?.id;
  if (!authUserId) throw new Error("Not signed in.");

  const { data: profileRow, error: pErr } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("auth_user_id", authUserId)
    .single();
  if (pErr || !profileRow) throw new Error("Profile not found.");

  const { data, error } = await supabase
    .from("open_games")
    .insert({
      creator_id: profileRow.id,
      course_id: input.course.id,
      starts_at: input.startsAt,
      available_spots: input.availableSpots,
      approval_required: input.approvalRequired,
      visibility: "public",
      description: input.description ?? null,
      holes: input.holes ?? null,
      estimated_price_cents: input.estimatedPriceCents ?? null,
      cart_included: input.cartIncluded ?? false,
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("Could not create game.");

  return {
    id: data.id as string,
    courseId: input.course.id,
    creatorId: profileRow.id,
    creatorName: profileRow.display_name,
    startsAt: input.startsAt,
    availableSpots: input.availableSpots,
    acceptedPlayerIds: [profileRow.id],
    waitlistedPlayerIds: [],
    approvalRequired: input.approvalRequired,
    visibility: "public",
    description: input.description,
    holes: input.holes,
    estimatedPriceCents: input.estimatedPriceCents,
    cartIncluded: input.cartIncluded,
    course: input.course,
  };
}

type MemberRow = { profile_id: string; status: string };
type OpenGameRow = {
  id: string;
  creator_id: string;
  course_id: string;
  starts_at: string;
  available_spots: number;
  approval_required: boolean;
  visibility: OpenGame["visibility"];
  description: string | null;
  holes: number | null;
  estimated_price_cents: number | null;
  cart_included: boolean | null;
  courses: { id: string; name: string; facility_name: string; city: string; state: string; zip_code: string } | null;
  creator: { display_name: string } | null;
  open_game_members: MemberRow[] | null;
};

/** Live, upcoming open games with course + host + member counts. */
export async function listOpenGames(): Promise<OpenGame[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("open_games")
    .select(
      `id, creator_id, course_id, starts_at, available_spots, approval_required, visibility,
       description, holes, estimated_price_cents, cart_included,
       courses ( id, name, facility_name, city, state, zip_code ),
       creator:profiles!open_games_creator_id_fkey ( display_name ),
       open_game_members ( profile_id, status )`,
    )
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(50);
  if (error) throw error;

  return ((data ?? []) as unknown as OpenGameRow[]).map((row) => {
    const members = row.open_game_members ?? [];
    const accepted = members.filter((m) => m.status === "accepted").map((m) => m.profile_id);
    const waitlisted = members.filter((m) => m.status === "waitlisted").map((m) => m.profile_id);
    const c = row.courses;
    return {
      id: row.id,
      courseId: row.course_id,
      creatorId: row.creator_id,
      creatorName: row.creator?.display_name,
      startsAt: row.starts_at,
      availableSpots: row.available_spots,
      acceptedPlayerIds: [row.creator_id, ...accepted],
      waitlistedPlayerIds: waitlisted,
      approvalRequired: row.approval_required,
      visibility: row.visibility,
      description: row.description ?? undefined,
      holes: (row.holes ?? undefined) as 9 | 18 | undefined,
      estimatedPriceCents: row.estimated_price_cents ?? undefined,
      cartIncluded: row.cart_included ?? undefined,
      course: c
        ? { id: c.id, name: c.name, facilityName: c.facility_name, city: c.city, state: c.state, zipCode: c.zip_code }
        : undefined,
    } satisfies OpenGame;
  });
}
