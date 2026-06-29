import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

const PRICES = {
  "plus-monthly": process.env.STRIPE_PRICE_PLUS_MONTHLY!,
  "plus-annual": process.env.STRIPE_PRICE_PLUS_ANNUAL!,
  "pro-monthly": process.env.STRIPE_PRICE_PRO_MONTHLY!,
  "pro-annual": process.env.STRIPE_PRICE_PRO_ANNUAL!,
} as const;

type PriceKey = keyof typeof PRICES;

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

  const { priceKey, founding } = await req.json() as { priceKey: PriceKey; founding?: boolean };
  if (!PRICES[priceKey]) return NextResponse.json({ error: "Invalid price" }, { status: 400 });

  const db = getServiceClient();

  // Get or create Stripe customer
  const { data: entitlement } = await db
    .from("subscription_entitlements")
    .select("stripe_customer_id, entitlement")
    .eq("profile_id", user.id)
    .single();

  let customerId = entitlement?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { profile_id: user.id },
    });
    customerId = customer.id;
  }

  // Apply founding coupon if eligible
  const couponId =
    founding && priceKey.startsWith("pro")
      ? process.env.STRIPE_COUPON_GOLFER_PRO_FOUNDING
      : undefined;

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: PRICES[priceKey] }],
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
