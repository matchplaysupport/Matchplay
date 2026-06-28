import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key);
}

export async function POST(req: Request) {
  let body: { email?: string; name?: string; audience?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
  if (body.company) return NextResponse.json({ ok: true });

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const audience = body.audience;

  if (!email || !name || !audience) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (name.length > 120) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }
  if (audience !== "golfer" && audience !== "course") {
    return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("waitlist").insert({ email, name, audience });

  if (error) {
    if (error.code === "23505") return NextResponse.json({ ok: true }); // already on list
    console.error("Waitlist insert error:", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
