"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

/** Cancels one of the signed-in golfer's bookings and restores the tee-time
 *  spot via the cancel_booking SECURITY DEFINER function (which verifies
 *  ownership). Falls back to a plain status update if that function isn't
 *  installed yet (cancel still works, just without restoring the spot). */
export async function cancelBooking(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  if (!bookingId) return { ok: false, error: "Missing booking." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { error: rpcError } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });
  if (rpcError) {
    // Fallback (e.g. migration not applied): mark cancelled without restoring
    // the spot. RLS limits this to the owner's own rows.
    const { error: updError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    if (updError) return { ok: false, error: "Couldn't cancel. Please try again." };
  }

  revalidatePath("/golfer/dashboard");
  return { ok: true };
}
