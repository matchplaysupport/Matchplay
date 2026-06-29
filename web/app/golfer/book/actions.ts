"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { resolveTier, hasPlus } from "@/lib/golfer-session";

type BookResult = { ok: true; code: string } | { ok: false; error: string };

/** Books a tee time: atomic spot reserve (SECURITY DEFINER rpc) + booking row.
 *  Mirrors the mobile SupabaseTeeTimeProvider flow. Re-checks entitlement here
 *  so the gate can't be bypassed from the client. */
export async function bookTeeTime(teeTimeId: string, players: number): Promise<BookResult> {
  if (!teeTimeId || !Number.isInteger(players) || players < 1 || players > 4) {
    return { ok: false, error: "Pick between 1 and 4 players." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false, error: "Finish setting up your profile first." };

  if (!hasPlus(await resolveTier(supabase, profile.id))) {
    return { ok: false, error: "Booking is a Clubhouse+ feature." };
  }

  const { data: reserved, error: rpcErr } = await supabase.rpc("reserve_tee_time_spots", {
    p_tee_time_id: teeTimeId,
    p_players: players,
  });
  if (rpcErr) return { ok: false, error: rpcErr.message };
  if (!reserved || (Array.isArray(reserved) && reserved.length === 0)) {
    return { ok: false, error: "This tee time is no longer available." };
  }

  const code = `MP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const { error: bookErr } = await supabase.from("bookings").insert({
    profile_id: profile.id,
    tee_time_id: teeTimeId,
    confirmation_code: code,
    players,
    community_spots: 0,
    status: "requested",
  });
  if (bookErr) return { ok: false, error: "Couldn't confirm the booking. Please try again." };

  revalidatePath("/golfer/book");
  revalidatePath("/golfer/dashboard");
  return { ok: true, code };
}
