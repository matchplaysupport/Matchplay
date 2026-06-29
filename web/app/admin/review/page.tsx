import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ReviewClient, { type Application } from "./ReviewClient";

export const metadata = { title: "Course applications · Review" };

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Reviewer gate — RLS also enforces this, but redirect non-admins cleanly.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/admin/dashboard");

  const { data: applications } = await supabase
    .from("course_applications")
    .select("id, contact_name, email, course_name, facility_name, city, state, zip_code, phone, status, review_notes, created_at")
    .order("created_at", { ascending: false });

  // Pending first, then most recent.
  const sorted = (applications ?? []).sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return 0;
  }) as Application[];

  return (
    <div style={{ padding: "2rem", maxWidth: 820 }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem" }}>
        Course applications
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
        Approve a course to provision its tee sheet and unlock the operator portal.
      </p>
      <ReviewClient applications={sorted} />
    </div>
  );
}
