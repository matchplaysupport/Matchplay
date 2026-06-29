import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceClient();

  const { data: entitlement } = await db
    .from("subscription_entitlements")
    .select("stripe_subscription_id")
    .eq("profile_id", user.id)
    .single();

  if (!entitlement?.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  // Cancel at period end — user keeps access until billing cycle ends
  await stripe.subscriptions.update(entitlement.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  return NextResponse.json({ cancelled: true });
}
