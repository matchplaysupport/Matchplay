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

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { founding } = await req.json() as { founding?: boolean };

  const db = getServiceClient();

  const { data: operator } = await db
    .from("course_operators")
    .select("id, stripe_customer_id, stripe_subscription_id, plan")
    .eq("auth_user_id", user.id)
    .single();

  if (!operator) return NextResponse.json({ error: "No course linked to this account" }, { status: 400 });
  if (operator.plan === "pro") return NextResponse.json({ error: "Already on Pro" }, { status: 400 });

  // Get or create Stripe customer
  let customerId = operator.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { course_operator_id: operator.id },
    });
    customerId = customer.id;

    await db
      .from("course_operators")
      .update({ stripe_customer_id: customerId })
      .eq("id", operator.id);
  }

  const priceId = process.env.STRIPE_PRICE_COURSE_PRO_MONTHLY!;
  const couponId = founding ? process.env.STRIPE_COUPON_COURSE_FOUNDING : undefined;

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    ...(couponId ? { coupon: couponId } : {}),
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  const invoice = subscription.latest_invoice as import("stripe").Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as import("stripe").Stripe.PaymentIntent;

  return NextResponse.json({
    subscriptionId: subscription.id,
    clientSecret: paymentIntent?.client_secret ?? null,
  });
}
