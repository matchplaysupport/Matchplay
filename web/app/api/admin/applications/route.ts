import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sendApplicationDecisionEmail, type ApplicationDecision } from "@/lib/email";

type Body = { applicationId?: string; action?: "approve" | "reject"; notes?: string | null };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { applicationId, action } = body;
  if (!applicationId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Missing applicationId or action" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // The RPCs enforce is_admin via auth.uid(); a non-admin caller gets "not authorized".
  if (action === "approve") {
    const { error } = await supabase.rpc("approve_course_application", { p_application_id: applicationId });
    if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  } else {
    const { error } = await supabase.rpc("reject_course_application", {
      p_application_id: applicationId,
      p_notes: body.notes ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  }

  // Notify the applicant. Non-fatal: the decision already succeeded above.
  const { data: app } = await supabase
    .from("course_applications")
    .select("email, contact_name, course_name, status, review_notes")
    .eq("id", applicationId)
    .maybeSingle();

  let emailed = false;
  if (app?.email) {
    const result = await sendApplicationDecisionEmail(app as ApplicationDecision);
    emailed = result.ok;
  }

  return NextResponse.json({ ok: true, emailed });
}
