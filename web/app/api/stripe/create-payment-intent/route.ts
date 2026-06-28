import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { stripe, PLATFORM_FEE_CENTS } from "@/lib/stripe";

// Mobile calls this with Authorization: Bearer <supabase_jwt>
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.replace("Bearer ", "");
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify JWT and get user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
  if (authErr || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { teeTimeId, players, bookingId } = await req.json() as {
    teeTimeId: string;
    players: number;
    bookingId: string;
  };

  if (!teeTimeId || !players || !bookingId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Fetch tee time + course's Stripe account
  const { data: teeTime } = await supabase
    .from("tee_times")
    .select("price_cents, course_id, courses(id)")
    .eq("id", teeTimeId)
    .single();

  if (!teeTime) return NextResponse.json({ error: "Tee time not found" }, { status: 404 });

  const { data: operator } = await supabase
    .from("course_operators")
    .select("stripe_account_id, stripe_onboarded")
    .eq("course_id", teeTime.course_id)
    .single();

  if (!operator?.stripe_account_id || !operator.stripe_onboarded) {
    return NextResponse.json({ error: "Course payment not set up yet" }, { status: 400 });
  }

  const totalCents = teeTime.price_cents * players;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: "usd",
    application_fee_amount: PLATFORM_FEE_CENTS,
    transfer_data: { destination: operator.stripe_account_id },
    metadata: { teeTimeId, players: String(players), bookingId, userId: user.id },
  });

  // Mark booking as payment_pending + store intent id
  await supabase
    .from("bookings")
    .update({
      stripe_payment_intent_id: paymentIntent.id,
      status: "payment_pending",
    })
    .eq("id", bookingId);

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
