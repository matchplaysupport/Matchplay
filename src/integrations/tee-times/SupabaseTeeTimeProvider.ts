import { supabase } from "@/lib/supabase";
import type { Booking, TeeTime } from "@/types/domain";
import type { CreateBookingInput, TeeTimeProvider, TeeTimeSearchFilters } from "./TeeTimeProvider";

export class SupabaseTeeTimeProvider implements TeeTimeProvider {
  async search(filters: TeeTimeSearchFilters): Promise<TeeTime[]> {
    let query = supabase
      .from("tee_times")
      .select("*, courses(id, name, city, state, zip_code, latitude, longitude)")
      .gt("available_spots", 0)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(50);

    if (filters.minPlayers) {
      query = query.gte("available_spots", filters.minPlayers);
    }
    if (filters.maxPriceCents) {
      query = query.lte("price_cents", filters.maxPriceCents);
    }
    if (filters.holes) {
      query = query.eq("holes", filters.holes);
    }
    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      query = query.gte("starts_at", start.toISOString()).lte("starts_at", end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = (data ?? []).map((row) => ({
      id: row.id as string,
      courseId: row.course_id as string,
      startsAt: row.starts_at as string,
      priceCents: row.price_cents as number,
      availableSpots: row.available_spots as number,
      holes: row.holes as 9 | 18,
      cartIncluded: row.cart_included as boolean,
      walkingAllowed: row.walking_allowed as boolean,
      cancellationLabel: row.cancellation_label as string,
    }));

    // Client-side text filter (city/course name search)
    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const matchingCourseIds = new Set(
        (data ?? [])
          .filter((row) => {
            const c = row.courses as { name: string; city: string; state: string; zip_code: string } | null;
            if (!c) return false;
            return (
              c.name.toLowerCase().includes(q) ||
              c.city.toLowerCase().includes(q) ||
              c.state.toLowerCase().includes(q) ||
              c.zip_code.includes(q)
            );
          })
          .map((row) => row.id),
      );
      results = results.filter((t) => matchingCourseIds.has(t.id));
    }

    if (filters.sortBy === "lowest_price") {
      results.sort((a, b) => a.priceCents - b.priceCents);
    }

    return results;
  }

  async reserve(input: CreateBookingInput): Promise<Booking> {
    // Resolve current user's profile id
    const { data: sessionData } = await supabase.auth.getSession();
    const authUserId = sessionData.session?.user?.id;
    if (!authUserId) throw new Error("Not signed in.");

    const { data: profileRow, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (profileErr || !profileRow) throw new Error("Profile not found.");

    const { data: teeTime, error: fetchErr } = await supabase
      .from("tee_times")
      .select("id, course_id, available_spots, price_cents")
      .eq("id", input.teeTimeId)
      .single();

    if (fetchErr || !teeTime) throw new Error("Tee time not found.");

    // Atomic decrement — returns nothing if spots are insufficient
    const { data: reserved, error: rpcErr } = await supabase
      .rpc("reserve_tee_time_spots", {
        p_tee_time_id: input.teeTimeId,
        p_players: input.players,
      });

    if (rpcErr) throw rpcErr;
    if (!reserved || (Array.isArray(reserved) && reserved.length === 0)) {
      throw new Error("This tee time is no longer available.");
    }

    const confirmationCode = `MP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { data: booking, error: bookErr } = await supabase
      .from("bookings")
      .insert({
        profile_id: profileRow.id,
        tee_time_id: input.teeTimeId,
        confirmation_code: confirmationCode,
        players: input.players,
        community_spots: input.communitySpots,
        status: "requested",
      })
      .select("id, tee_time_id, confirmation_code, players, community_spots, status, created_at")
      .single();

    if (bookErr || !booking) throw bookErr ?? new Error("Booking failed.");

    return {
      id: booking.id,
      teeTimeId: booking.tee_time_id,
      courseId: teeTime.course_id,
      confirmationCode: booking.confirmation_code,
      players: booking.players,
      communitySpots: booking.community_spots,
      createdAt: booking.created_at,
      status: "requested",
      source: "operator",
      fulfillmentLabel: "Booking confirmed",
    };
  }

  async listUpcomingBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, tee_times(course_id)")
      .in("status", ["requested", "confirmed"])
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      teeTimeId: row.tee_time_id,
      courseId: (row.tee_times as { course_id: string } | null)?.course_id ?? "",
      confirmationCode: row.confirmation_code,
      players: row.players,
      communitySpots: row.community_spots,
      createdAt: row.created_at,
      status: row.status,
    }));
  }
}
