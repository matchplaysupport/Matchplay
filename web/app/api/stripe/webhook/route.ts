import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

const PLUS_PRICES = new Set([
  process.env.STRIPE_PRICE_PLUS_MONTHLY,
  process.env.STRIPE_PRICE_PLUS_ANNUAL,
]);

function resolveEntitlement(priceId: string | undefined): "plus" | "pro" {
  return PLUS_PRICES.has(priceId) ? "plus" : "pro";
}

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
    const onboarded = account.charges_enabled && account.payouts_enabled;
    if (onboarded) {
      await supabase
        .from("course_operators")
        .update({ stripe_onboarded: true })
        .eq("stripe_account_id", account.id);
    }
  }

  // Subscription lifecycle — handles both golfers and course operators
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = event.data.object as any;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const active = sub.status === "active" || sub.status === "trialing";
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    // Check which table owns this customer ID
    const { data: operator } = await supabase
      .from("course_operators")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (operator) {
      // Course operator subscription
      await supabase
        .from("course_operators")
        .update({
          plan: active ? "pro" : "free",
          stripe_subscription_id: active ? sub.id : null,
          current_period_end: active ? periodEnd : null,
        })
        .eq("stripe_customer_id", customerId);
    } else {
      // Golfer subscription
      const priceId = sub.items.data[0]?.price.id;
      const entitlement = active ? resolveEntitlement(priceId) : "free";

      await supabase
        .from("subscription_entitlements")
        .upsert(
          {
            stripe_customer_id: customerId,
            stripe_subscription_id: active ? sub.id : null,
            entitlement,
            current_period_end: active ? periodEnd : null,
            source: "stripe",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_customer_id" },
        );
    }
  }

  return NextResponse.json({ received: true });
}
