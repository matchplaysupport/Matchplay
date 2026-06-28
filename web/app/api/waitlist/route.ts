import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name, audience } = await req.json();

  if (!email || !name || !audience) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // TODO: persist to Supabase waitlist table or send to Resend/Loops
  console.log("Waitlist signup:", { email, name, audience });

  return NextResponse.json({ ok: true });
}
