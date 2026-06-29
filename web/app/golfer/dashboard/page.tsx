import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import SignOutButton from "./SignOutButton";

export const metadata = { title: "Your dashboard · Golfers" };

type BookingRow = {
  id: string;
  players: number;
  confirmation_code: string;
  tee_times: {
    starts_at: string;
    holes: number;
    price_cents: number;
    courses: { name: string; city: string; state: string } | null;
  } | null;
};

export default async function GolferDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/golfer/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, city, state, skill_level, handicap_value, handicap_source")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Confirmed account but no profile row (rare) — point them at support/app.
  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem" }}>Account setup incomplete</h1>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            We couldn&apos;t find your golfer profile. Finish setting up in the mobile app, or contact support.
          </p>
          <SignOutButton />
        </div>
      </div>
    );
  }

  const nowIso = new Date().toISOString();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, players, confirmation_code, tee_times!inner(starts_at, holes, price_cents, courses(name, city, state))")
    .eq("profile_id", profile.id)
    .gt("tee_times.starts_at", nowIso)
    .limit(20);

  // Sort by tee time soonest-first (ordering by an embedded table is version-sensitive).
  const upcoming = ((bookings ?? []) as unknown as BookingRow[])
    .filter((b) => b.tee_times)
    .sort((a, b) => (a.tee_times!.starts_at < b.tee_times!.starts_at ? -1 : 1))
    .slice(0, 10);

  const handicap =
    profile.handicap_source !== "none" && profile.handicap_value != null
      ? Number(profile.handicap_value).toFixed(1)
      : "—";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>⛳</span>
            <span style={{ fontWeight: 700, color: "var(--brand)", fontSize: "0.95rem" }}>The Clubhouse</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>
          Hi, {profile.display_name.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          @{profile.username} · {profile.city}, {profile.state}
        </p>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", margin: "1.75rem 0 2rem" }}>
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Handicap</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginTop: "0.375rem" }}>{handicap}</p>
          </div>
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Skill level</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", marginTop: "0.5rem", textTransform: "capitalize" }}>{profile.skill_level}</p>
          </div>
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Upcoming</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginTop: "0.375rem" }}>{upcoming.length}</p>
          </div>
        </div>

        {/* Upcoming tee times */}
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>Upcoming tee times</h2>
        {upcoming.length === 0 ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            <p style={{ marginBottom: "1rem" }}>No upcoming tee times yet.</p>
            <Link href="/golfer" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>Find a tee time</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {upcoming.map((b) => {
              const tt = b.tee_times;
              if (!tt) return null;
              const dt = new Date(tt.starts_at);
              return (
                <div key={b.id} className="card" style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--text)" }}>
                      {tt.courses?.name ?? "Course"}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.125rem" }}>
                      {dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {" · "}
                      {dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      {" · "}
                      {tt.holes} holes · {b.players} player{b.players !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--brand)", background: "rgba(26,122,69,0.1)", padding: "0.2rem 0.55rem", borderRadius: 999 }}>
                    {b.confirmation_code}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue in app */}
        <div className="card" style={{ marginTop: "2rem", padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)" }}>Get the full experience in the app</p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.25rem" }}>
              Live scoring, match play, handicaps, and leaderboards live in the mobile app.
            </p>
          </div>
          <Link href="/golfer" className="btn btn-ghost" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            Get the app →
          </Link>
        </div>
      </div>
    </div>
  );
}
