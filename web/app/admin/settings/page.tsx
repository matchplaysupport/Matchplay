import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import SettingsClient from "./SettingsClient";

export const metadata = { title: "Settings · Match Play Admin" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: operator } = await supabase
    .from("course_operators")
    .select("course_id, courses(*)")
    .eq("auth_user_id", user.id)
    .single();

  const course = operator?.courses as unknown as {
    id: string; name: string; facility_name: string;
    city: string; state: string; zip_code: string;
    latitude: number; longitude: number; amenities: string[];
  } | null;

  return (
    <SettingsClient
      authUserId={user.id}
      courseId={operator?.course_id ?? null}
      course={course}
    />
  );
}
