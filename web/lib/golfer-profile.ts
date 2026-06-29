import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Ensures the signed-in golfer has a `profiles` row, creating one from the
 * metadata captured at sign-up if it's missing. This covers the email-
 * confirmation flow, where no session exists at sign-up time so the profile
 * can't be inserted until the first authenticated load. No-ops for golfers
 * who already onboarded (e.g. in the mobile app).
 */
export async function ensureGolferProfile(client: SupabaseClient, user: User): Promise<void> {
  const { data: existing } = await client
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing) return;

  const md = user.user_metadata ?? {};
  if (!md.username || !md.display_name) return; // Not enough to build a profile.

  await client.from("profiles").insert({
    auth_user_id: user.id,
    display_name: md.display_name,
    username: md.username,
    city: md.city ?? "",
    state: md.state ?? "",
    zip_code: md.zip_code ?? "",
    skill_level: "casual",
    handicap_source: "none",
    preferred_game_style: "both",
  });
}
