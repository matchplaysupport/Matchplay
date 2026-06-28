import { supabase } from "./supabase";
import type { Profile } from "@/types/domain";

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function fetchProfile(authUserId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, display_name, username, city, state, zip_code,
      skill_level, handicap_source, handicap_value,
      preferred_radius_miles, preferred_game_style,
      reliability_label, is_demo,
      user_privacy_settings (
        hide_exact_age, hide_handicap, hide_round_history,
        hide_profile_discovery, hide_approximate_location, hide_leaderboards
      )
    `)
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !data) return null;

  const privacy = Array.isArray(data.user_privacy_settings)
    ? data.user_privacy_settings[0]
    : data.user_privacy_settings;

  return {
    id: data.id,
    displayName: data.display_name,
    username: data.username,
    city: data.city,
    state: data.state,
    zipCode: data.zip_code,
    skillLevel: data.skill_level as Profile["skillLevel"],
    handicapSource: data.handicap_source as Profile["handicapSource"],
    handicapValue: data.handicap_value ?? undefined,
    preferredRadiusMiles: data.preferred_radius_miles,
    preferredGameStyle: data.preferred_game_style as Profile["preferredGameStyle"],
    reliabilityLabel: data.reliability_label as Profile["reliabilityLabel"],
    privacy: {
      hideExactAge: privacy?.hide_exact_age ?? true,
      hideHandicap: privacy?.hide_handicap ?? false,
      hideRoundHistory: privacy?.hide_round_history ?? false,
      hideProfileDiscovery: privacy?.hide_profile_discovery ?? false,
      hideApproximateLocation: privacy?.hide_approximate_location ?? false,
      hideLeaderboards: privacy?.hide_leaderboards ?? false,
    },
  };
}

export async function createProfile(
  authUserId: string,
  data: {
    displayName: string;
    username: string;
    city: string;
    state: string;
    zipCode: string;
    skillLevel: string;
    handicapSource: string;
    handicapValue?: number;
    preferredRadiusMiles: number;
    preferredGameStyle: string;
  },
): Promise<string> {
  const { data: row, error } = await supabase
    .from("profiles")
    .insert({
      auth_user_id: authUserId,
      display_name: data.displayName,
      username: data.username,
      city: data.city,
      state: data.state,
      zip_code: data.zipCode || "00000",
      skill_level: data.skillLevel,
      handicap_source: data.handicapSource,
      handicap_value: data.handicapValue ?? null,
      preferred_radius_miles: data.preferredRadiusMiles,
      preferred_game_style: data.preferredGameStyle,
      reliability_label: "New player",
    })
    .select("id")
    .single();

  if (error || !row) throw error ?? new Error("Profile creation failed");

  // Create default privacy settings
  await supabase.from("user_privacy_settings").insert({ profile_id: row.id });

  return row.id;
}
