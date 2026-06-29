import { supabase } from "@/lib/supabase";
import type { CourseSummary, OpenGame } from "@/types/domain";

export interface CreateOpenGameInput {
  courseId: string;
  startsAt: string;
  availableSpots: number;
  approvalRequired: boolean;
  visibility: "public" | "friends" | "invite_only";
  description?: string;
  holes?: 9 | 18;
  estimatedPriceCents?: number;
  cartIncluded?: boolean;
  handicapRangeMin?: number;
  handicapRangeMax?: number;
}

type MemberRow = { profile_id: string; status: string };

type OpenGameRow = {
  id: string;
  course_id: string;
  creator_id: string;
  starts_at: string;
  available_spots: number;
  approval_required: boolean;
  visibility: string;
  description: string | null;
  holes: number | null;
  estimated_price_cents: number | null;
  cart_included: boolean | null;
  handicap_range_min: number | null;
  handicap_range_max: number | null;
  open_game_members: MemberRow[] | null;
  course: {
    id: string;
    name: string;
    facility_name: string;
    city: string;
    state: string;
    zip_code: string;
  } | null;
  creator: { display_name: string } | null;
};

/** Live open-game discovery + creation. Reads use the public-read RLS policy;
 *  creation goes through the atomic create_open_game RPC. */
export class SupabaseOpenGamesProvider {
  async list(): Promise<OpenGame[]> {
    const { data, error } = await supabase
      .from("open_games")
      .select(
        `id, course_id, creator_id, starts_at, available_spots, approval_required, visibility,
         description, holes, estimated_price_cents, cart_included, handicap_range_min, handicap_range_max,
         open_game_members ( profile_id, status ),
         course:courses ( id, name, facility_name, city, state, zip_code ),
         creator:profiles!creator_id ( display_name )`,
      )
      .eq("visibility", "public")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(50);

    if (error || !data) return [];

    return (data as unknown as OpenGameRow[]).map((row) => {
      const members = row.open_game_members ?? [];
      const course: CourseSummary | undefined = row.course
        ? {
            id: row.course.id,
            name: row.course.name,
            facilityName: row.course.facility_name,
            city: row.course.city,
            state: row.course.state,
            zipCode: row.course.zip_code,
          }
        : undefined;
      return {
        id: row.id,
        courseId: row.course_id,
        creatorId: row.creator_id,
        startsAt: row.starts_at,
        availableSpots: row.available_spots,
        acceptedPlayerIds: members.filter((m) => m.status === "accepted").map((m) => m.profile_id),
        waitlistedPlayerIds: members.filter((m) => m.status === "waitlisted").map((m) => m.profile_id),
        approvalRequired: row.approval_required,
        visibility: row.visibility as OpenGame["visibility"],
        description: row.description ?? undefined,
        holes: (row.holes ?? undefined) as OpenGame["holes"],
        estimatedPriceCents: row.estimated_price_cents ?? undefined,
        cartIncluded: row.cart_included ?? undefined,
        handicapRangeMin: row.handicap_range_min ?? undefined,
        handicapRangeMax: row.handicap_range_max ?? undefined,
        course,
        creatorName: row.creator?.display_name ?? undefined,
      };
    });
  }

  /** Returns the new game's id. Throws if the course id isn't a real course. */
  async create(input: CreateOpenGameInput): Promise<string> {
    const { data, error } = await supabase.rpc("create_open_game", {
      p_course_id: input.courseId,
      p_starts_at: input.startsAt,
      p_available_spots: input.availableSpots,
      p_approval_required: input.approvalRequired,
      p_visibility: input.visibility,
      p_description: input.description ?? null,
      p_holes: input.holes ?? null,
      p_estimated_price_cents: input.estimatedPriceCents ?? null,
      p_cart_included: input.cartIncluded ?? null,
      p_handicap_range_min: input.handicapRangeMin ?? null,
      p_handicap_range_max: input.handicapRangeMax ?? null,
    });
    if (error) throw error;
    return data as string;
  }
}
