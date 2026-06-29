import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase-service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golftheclubhouse.com";

type Body = {
  name?: string;
  email?: string;
  password?: string;
  city?: string;
  state?: string;
  zip?: string;
  company?: string; // honeypot
};

function usernameBase(name: string, email: string) {
  const fromName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fromEmail = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  return (fromName || fromEmail || "golfer").slice(0, 20);
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.company) return NextResponse.json({ ok: true }); // honeypot

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const city = (body.city ?? "").trim();
  const state = (body.state ?? "").trim();
  const zip = (body.zip ?? "").trim();

  if (!name || !city || !state || !zip) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // 1. Create the auth account (sends confirmation email).
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: signUp, error: signUpError } = await anon.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${SITE_URL}/golfer/login`, data: { role: "golfer", display_name: name } },
  });
  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  const userId = signUp.user?.id;
  const alreadyRegistered = signUp.user && (signUp.user.identities?.length ?? 0) === 0;
  if (!userId || alreadyRegistered) {
    return NextResponse.json(
      { error: "That email already has an account. Sign in instead." },
      { status: 409 },
    );
  }

  // 2. The handle_new_golfer trigger creates the profile row from the signup
  //    metadata in the same transaction as the auth user, so it always exists.
  //    Fill in the location fields the golfer entered.
  const svc = createServiceClient();
  const { data: updated, error: updateError } = await svc
    .from("profiles")
    .update({ city, state, zip_code: zip })
    .eq("auth_user_id", userId)
    .select("id");

  if (updateError) {
    console.error("Golfer profile update error:", updateError);
    return NextResponse.json({ error: "Could not finish setting up your account." }, { status: 500 });
  }

  // Fallback: if the trigger isn't installed yet, create the profile directly.
  //    Retry on username collision (profiles.username is unique).
  if (!updated || updated.length === 0) {
    const base = usernameBase(name, email);
    let lastError: { code?: string; message?: string } | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const username = attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
      const { error: insertError } = await svc.from("profiles").insert({
        auth_user_id: userId,
        display_name: name,
        username,
        city,
        state,
        zip_code: zip,
        skill_level: "casual",
        handicap_source: "none",
        preferred_game_style: "both",
      });
      if (!insertError) return NextResponse.json({ ok: true });
      lastError = insertError;
      // 23505 on username → retry with a suffix; on auth_user_id → already has a profile.
      if (insertError.code === "23505") {
        if (insertError.message?.includes("auth_user_id")) return NextResponse.json({ ok: true });
        continue;
      }
      break;
    }

    console.error("Golfer profile insert error:", lastError);
    return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
