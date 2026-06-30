import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { PortalNav } from "../PortalNav";
import ProfileForm, { type ProfileFormData } from "./ProfileForm";

export const metadata = {
  title: "Profile · The Clubhouse",
};

export default async function GolferProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/golfer/login");

  // select("*") tolerates the bio/phone/avatar_url columns not existing yet
  // (before the migration is applied) instead of hard-failing.
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    return (
      <main className="theme-club" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Finish setting up your profile</h1>
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            Complete onboarding in the app to manage your profile here.
          </p>
        </div>
      </main>
    );
  }

  const { data: privacy } = await supabase
    .from("user_privacy_settings")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const initial: ProfileFormData = {
    profileId: profile.id,
    displayName: profile.display_name ?? "",
    username: profile.username ?? "",
    email: user.email ?? "",
    phone: profile.phone ?? "",
    bio: profile.bio ?? "",
    skillLevel: profile.skill_level ?? "casual",
    preferredGameStyle: profile.preferred_game_style ?? "both",
    city: profile.city ?? "",
    state: profile.state ?? "",
    zipCode: profile.zip_code ?? "",
    avatarUrl: profile.avatar_url ?? null,
    privacy: {
      hideHandicap: privacy?.hide_handicap ?? false,
      hideApproximateLocation: privacy?.hide_approximate_location ?? false,
      hideRoundHistory: privacy?.hide_round_history ?? false,
      hideProfileDiscovery: privacy?.hide_profile_discovery ?? false,
      hideLeaderboards: privacy?.hide_leaderboards ?? false,
    },
  };

  return (
    <main className="theme-club" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PortalNav displayName={profile.display_name} avatarUrl={profile.avatar_url} active="profile" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1
          className="text-2xl font-extrabold mb-6"
          style={{ fontFamily: "var(--font-sora)", color: "var(--text)", letterSpacing: "0.12em" }}
        >
          PROFILE
        </h1>
        <ProfileForm initial={initial} authUserId={user.id} />
      </div>
    </main>
  );
}
