import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key);
}

export async function POST(req: Request) {
  const { email, name, audience } = await req.json();

  if (!email || !name || !audience) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("waitlist")
    .insert({ email, name, audience });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    console.error("Waitlist insert error:", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
