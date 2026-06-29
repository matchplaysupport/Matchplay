import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase-service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golftheclubhouse.com";

type Body = {
  contactName?: string;
  email?: string;
  password?: string;
  courseName?: string;
  facilityName?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  company?: string; // honeypot
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot — bots fill this hidden field. Pretend success.
  if (body.company) return NextResponse.json({ ok: true });

  const contactName = (body.contactName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const courseName = (body.courseName ?? "").trim();
  const facilityName = (body.facilityName ?? "").trim() || courseName;
  const city = (body.city ?? "").trim();
  const state = (body.state ?? "").trim();
  const zip = (body.zip ?? "").trim();
  const phone = (body.phone ?? "").trim() || null;

  if (!contactName || !courseName || !city || !state || !zip) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // 1. Create the operator's auth account. Anon signUp triggers the confirmation
  //    email; with confirmations on, no session is returned here.
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: signUp, error: signUpError } = await anon.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/admin/login`,
      data: { role: "course", contact_name: contactName },
    },
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  // Supabase returns a user with an empty identities array when the email is
  // already registered (anti-enumeration). Treat that as "already have an account".
  const userId = signUp.user?.id;
  const alreadyRegistered = signUp.user && (signUp.user.identities?.length ?? 0) === 0;
  if (!userId || alreadyRegistered) {
    return NextResponse.json(
      { error: "That email already has an account. Sign in instead." },
      { status: 409 },
    );
  }

  // 2. File the application with the service role (the user has no session yet).
  const svc = createServiceClient();
  const { error: insertError } = await svc.from("course_applications").insert({
    auth_user_id: userId,
    contact_name: contactName,
    email,
    course_name: courseName,
    facility_name: facilityName,
    city,
    state,
    zip_code: zip,
    phone,
    status: "pending",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true }); // already applied
    }
    console.error("Course application insert error:", insertError);
    return NextResponse.json({ error: "Could not submit your application." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
