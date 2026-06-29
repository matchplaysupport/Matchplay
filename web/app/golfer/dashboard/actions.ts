"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

/** Cancels one of the signed-in golfer's bookings. RLS limits the update to
 *  the owner's own rows, so passing another user's id is a safe no-op.
 *  Note: this marks the booking cancelled but does not restore the tee-time
 *  spot (golfers can't write tee_times; a release function would be needed). */
export async function cancelBooking(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  if (!bookingId) return { ok: false, error: "Missing booking." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);
  if (error) return { ok: false, error: "Couldn't cancel. Please try again." };

  revalidatePath("/golfer/dashboard");
  return { ok: true };
}
