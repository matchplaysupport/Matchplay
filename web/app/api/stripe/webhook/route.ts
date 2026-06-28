import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

// Use service role key for webhook — bypasses RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getServiceClient();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const { bookingId } = pi.metadata as { bookingId?: string };
    if (bookingId) {
      await supabase
        .from("bookings")
        .update({ status: "confirmed", amount_paid_cents: pi.amount_received })
        .eq("id", bookingId);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    const { bookingId, teeTimeId, players } = pi.metadata as {
      bookingId?: string;
      teeTimeId?: string;
      players?: string;
    };
    if (bookingId) {
      // Cancel booking and restore spots
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (teeTimeId && players) {
        const { data: tt } = await supabase
          .from("tee_times")
          .select("available_spots")
          .eq("id", teeTimeId)
          .single();
        if (tt) {
          await supabase
            .from("tee_times")
            .update({ available_spots: tt.available_spots + Number(players) })
            .eq("id", teeTimeId);
        }
      }
    }
  }

  // Mark Connect account as onboarded when capabilities are active
  if (event.type === "account.updated") {
    const account = event.data.object;
    const onboarded =
      account.charges_enabled && account.payouts_enabled;
    if (onboarded) {
      await supabase
        .from("course_operators")
        .update({ stripe_onboarded: true })
        .eq("stripe_account_id", account.id);
    }
  }

  return NextResponse.json({ received: true });
}
