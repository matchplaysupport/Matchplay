import Link from "next/link";
import { PortalShell, ProfileSetupNotice } from "../_components/PortalShell";
import { loadGolfer } from "@/lib/golfer-session";
import CancelBookingButton from "./CancelBookingButton";

export const metadata = { title: "Your dashboard · The Clubhouse" };

type BookingRow = {
  id: string;
  players: number;
  confirmation_code: string;
  status: string;
  tee_times: {
    starts_at: string;
    holes: number;
    price_cents: number;
    courses: { name: string; city: string; state: string } | null;
  } | null;
};

const QUICK_LINKS = [
  { href: "/golfer/book", title: "Book a tee time", body: "Find and reserve a round near you." },
  { href: "/golfer/stats", title: "Games & handicap", body: "Your Clubhouse Estimate and round history." },
  { href: "/golfer/leaderboards", title: "Leaderboards", body: "Live scoreboards and player rankings." },
  { href: "/golfer/tournaments", title: "Tournaments", body: "Browse events or host your own." },
];

export default async function GolferDashboardPage() {
  const { supabase, profile } = await loadGolfer();
  if (!profile) {
    return <PortalShell active="/golfer/dashboard"><ProfileSetupNotice /></PortalShell>;
  }

  const nowIso = new Date().toISOString();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, players, confirmation_code, status, tee_times!inner(starts_at, holes, price_cents, courses(name, city, state))")
    .eq("profile_id", profile.id)
    .gt("tee_times.starts_at", nowIso)
    .limit(20);

  const upcoming = ((bookings ?? []) as unknown as BookingRow[])
    .filter((b) => b.tee_times && b.status !== "cancelled")
    .sort((a, b) => (a.tee_times!.starts_at < b.tee_times!.starts_at ? -1 : 1))
    .slice(0, 10);

  const handicap =
    profile.handicap_source !== "none" && profile.handicap_value != null
      ? Number(profile.handicap_value).toFixed(1)
      : "—";

  return (
    <PortalShell active="/golfer/dashboard">
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>
        Hi, {profile.display_name.split(" ")[0]} 👋
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
        @{profile.username} · {profile.city}, {profile.state}
      </p>

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

      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>Upcoming tee times</h2>
      {upcoming.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
          <p style={{ marginBottom: "1rem" }}>No upcoming tee times yet.</p>
          <Link href="/golfer/book" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>Find a tee time</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {upcoming.map((b) => {
            const tt = b.tee_times!;
            const dt = new Date(tt.starts_at);
            return (
              <div key={b.id} className="card" style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--text)" }}>{tt.courses?.name ?? "Course"}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.125rem" }}>
                    {dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}{dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    {" · "}{tt.holes} holes · {b.players} player{b.players !== 1 ? "s" : ""}
                  </p>
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--brand)", background: "rgba(26,122,69,0.1)", padding: "0.2rem 0.55rem", borderRadius: 999 }}>
                  {b.confirmation_code}
                </span>
                <CancelBookingButton bookingId={b.id} />
              </div>
            );
          })}
        </div>
      )}

      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", margin: "2rem 0 1rem" }}>Quick actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
        {QUICK_LINKS.map((q) => (
          <Link key={q.href} href={q.href} className="card" style={{ padding: "1.25rem", textDecoration: "none" }}>
            <p style={{ fontWeight: 700, color: "var(--text)" }}>{q.title}</p>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.25rem" }}>{q.body}</p>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}
