import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

type PublicProfile = {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  skill_level: string;
  preferred_game_style: string;
  reliability_label: string;
  handicap_value: number | null;
  city: string | null;
  state: string | null;
  rounds_played: number | null;
  hide_leaderboards: boolean;
  member_since: string;
};

function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function Chip({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className="chip"
      style={{ background: "var(--surface-3)", color: gold ? "var(--gold)" : "var(--brand-bright)" }}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center px-3 py-4">
      <div className="font-extrabold" style={{ fontFamily: "var(--font-sora)", fontSize: "1.7rem", color: "var(--text)" }}>{value}</div>
      <div className="text-[0.68rem] font-bold uppercase mt-1" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="theme-club" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/golfer" className="font-bold" style={{ color: "var(--text)", letterSpacing: "0.04em" }}>THE CLUBHOUSE</Link>
          <Link href="/golfer/dashboard" className="text-sm font-medium" style={{ color: "var(--muted)" }}>Dashboard</Link>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">{children}</div>
    </main>
  );
}

function NotAvailable() {
  return (
    <Frame>
      <div className="card p-10 text-center">
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Profile not available</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          This player doesn&apos;t exist or has set their profile to private.
        </p>
        <Link href="/golfer/dashboard" className="btn btn-ghost mt-6 inline-flex">Back to dashboard</Link>
      </div>
    </Frame>
  );
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("public_player_profile", { p_username: username });
  const profile = (data as PublicProfile[] | null)?.[0];
  if (error || !profile) return <NotAvailable />;

  // Best public leaderboard standing (public read), unless hidden.
  let rank: number | null = null;
  if (!profile.hide_leaderboards) {
    const { data: rankRows } = await supabase
      .from("leaderboard_entries")
      .select("rank")
      .eq("profile_id", profile.id)
      .order("rank", { ascending: true })
      .limit(1);
    rank = rankRows?.[0]?.rank ?? null;
  }

  // Viewer context — show a (stubbed) invite CTA to other signed-in golfers.
  const { data: { user } } = await supabase.auth.getUser();
  const { data: viewer } = user
    ? await supabase.from("profiles").select("id").eq("auth_user_id", user.id).maybeSingle()
    : { data: null };
  const isSelf = viewer?.id === profile.id;
  const isSignedIn = Boolean(user);

  const location = [profile.city, profile.state].filter(Boolean).join(", ");
  const memberSince = new Date(profile.member_since).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Frame>
      {/* Header */}
      <div className="card p-6 sm:p-7">
        <div className="flex items-center gap-4 sm:gap-5">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" style={{ width: 76, height: 76, borderRadius: 999, objectFit: "cover", border: "1px solid var(--border-strong)" }} />
          ) : (
            <span style={{ width: 76, height: 76, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 700, color: "#fff", background: "var(--grad-brand)" }}>
              {(profile.display_name.trim()[0] ?? "?").toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}>
              {profile.display_name}
            </h1>
            <div className="text-sm" style={{ color: "var(--muted)" }}>@{profile.username}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chip gold>{profile.reliability_label}</Chip>
              <Chip>{cap(profile.skill_level)}</Chip>
              <Chip>{cap(profile.preferred_game_style)} play</Chip>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ color: "var(--text-2)" }}>
          {location && <span>📍 {location}</span>}
          <span>Member since {memberSince}</span>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{profile.bio}</p>
        )}

        {isSignedIn && !isSelf && (
          <Link href="/golfer/dashboard#matches" className="btn btn-gold mt-6 inline-flex" style={{ padding: "0.6rem 1.4rem" }}>
            Invite to a game
          </Link>
        )}
        {isSelf && (
          <Link href="/golfer/profile" className="btn btn-ghost mt-6 inline-flex" style={{ padding: "0.6rem 1.4rem" }}>
            Edit your profile
          </Link>
        )}
      </div>

      {/* Stat strip */}
      <div className="card mt-4 flex divide-x divide-[var(--border)]">
        <Stat label="Handicap" value={profile.handicap_value != null ? Number(profile.handicap_value).toFixed(1) : "—"} />
        <Stat label="Rounds" value={profile.rounds_played != null ? String(profile.rounds_played) : "—"} />
        <Stat label="Best Rank" value={rank != null ? `#${rank}` : "—"} />
      </div>
    </Frame>
  );
}
