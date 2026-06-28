import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public signup count. Reads are otherwise locked to service-role, so this
// relies on the `waitlist_count()` SECURITY DEFINER function (granted to anon).
export const revalidate = 60;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ count: null });

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.rpc("waitlist_count");
    if (error || typeof data !== "number") return NextResponse.json({ count: null });
    return NextResponse.json({ count: data });
  } catch {
    return NextResponse.json({ count: null });
  }
}
