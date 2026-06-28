import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminShell from "./AdminShell";

export const metadata = { title: "The Clubhouse Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Fetch operator's course
  const { data: operator } = await supabase
    .from("course_operators")
    .select("course_id, role, courses(id, name, city, state)")
    .eq("auth_user_id", user.id)
    .single();

  return (
    <AdminShell
      email={user.email ?? ""}
      courseName={(operator?.courses as unknown as { name: string } | null)?.name ?? null}
      courseId={operator?.course_id ?? null}
    >
      {children}
    </AdminShell>
  );
}
