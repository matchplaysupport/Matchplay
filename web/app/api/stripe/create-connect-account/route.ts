import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";

const RETURN_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/settings?stripe=connected`;
const REFRESH_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/settings?stripe=refresh`;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: operator } = await supabase
    .from("course_operators")
    .select("id, course_id, stripe_account_id, stripe_onboarded")
    .eq("auth_user_id", user.id)
    .single();

  if (!operator) return NextResponse.json({ error: "No course linked to this account" }, { status: 400 });

  let accountId = operator.stripe_account_id;

  // Create Express account if not yet done
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_type: "company",
      metadata: { course_operator_id: operator.id, course_id: operator.course_id },
    });
    accountId = account.id;
    await supabase
      .from("course_operators")
      .update({ stripe_account_id: accountId })
      .eq("id", operator.id);
  }

  // Generate onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: REFRESH_URL,
    return_url: RETURN_URL,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
