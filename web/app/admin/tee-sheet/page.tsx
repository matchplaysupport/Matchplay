import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import TeeSheetClient from "./TeeSheetClient";

export const metadata = { title: "Tee Sheet · Match Play Admin" };

export default async function TeeSheetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: operator } = await supabase
    .from("course_operators")
    .select("course_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!operator) redirect("/admin/settings");

  const { data: teeTimes } = await supabase
    .from("tee_times")
    .select("*")
    .eq("course_id", operator.course_id)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(100);

  return (
    <TeeSheetClient
      courseId={operator.course_id}
      initialTeeTimes={teeTimes ?? []}
    />
  );
}
