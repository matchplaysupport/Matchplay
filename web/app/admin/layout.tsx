import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminShell from "./AdminShell";

export const metadata = { title: "The Clubhouse Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Fetch operator's course (maybeSingle: a freshly-signed-up operator whose
  // application is still pending has no course_operators row yet).
  const { data: operator } = await supabase
    .from("course_operators")
    .select("course_id, role, courses(id, name, city, state)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Is this user a reviewer? (drives the Review nav item)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return (
    <AdminShell
      email={user.email ?? ""}
      courseName={(operator?.courses as unknown as { name: string } | null)?.name ?? null}
      courseId={operator?.course_id ?? null}
      isAdmin={profile?.is_admin ?? false}
    >
      {children}
    </AdminShell>
  );
}
