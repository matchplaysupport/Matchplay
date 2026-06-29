import Link from "next/link";
import { PortalShell, Notice, ProfileSetupNotice } from "../_components/PortalShell";
import { loadGolfer, hasPro } from "@/lib/golfer-session";

export const metadata = { title: "Leaderboards · The Clubhouse" };

type EventRow = {
  slug: string;
  name: string;
  event_type: string;
  status: string;
  courses: { name: string } | null;
};

type RankRow = {
  profile_id: string;
  rank: number;
  points: number;
  verified: boolean;
  scope: string;
  profiles: { display_name: string; city: string; state: string } | null;
};

// leaderboard_entries can hold several rows per player (different period /
// category). Rows arrive ordered by rank, so keep each player's first (best)
// entry and cap the list.
function dedupeByPlayer(rows: RankRow[], top: number): RankRow[] {
  const seen = new Set<string>();
  const out: RankRow[] = [];
  for (const r of rows) {
    if (seen.has(r.profile_id)) continue;
    seen.add(r.profile_id);
    out.push(r);
    if (out.length >= top) break;
  }
  return out;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", margin: "2rem 0 1rem" }}>{children}</h2>;
}

function RankTable({ rows }: { rows: RankRow[] }) {
  if (rows.length === 0) {
    return <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No ranked players yet.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {rows.map((r, i) => (
        <div key={`${r.scope}-${r.rank}-${i}`} className="card" style={{ padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <span style={{ fontWeight: 800, color: "var(--brand)", width: 28, textAlign: "center" }}>{r.rank}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
              {r.profiles?.display_name ?? "Player"}
              {r.verified && <span style={{ fontSize: "0.66rem", color: "var(--brand)", marginLeft: 6 }}>✓ verified</span>}
            </p>
            {r.profiles && <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{r.profiles.city}, {r.profiles.state}</p>}
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{r.points} pts</span>
        </div>
      ))}
    </div>
  );
}

export default async function LeaderboardsPage() {
  const { supabase, profile, tier } = await loadGolfer();
  if (!profile) {
    return <PortalShell active="/golfer/leaderboards"><ProfileSetupNotice /></PortalShell>;
  }

  const { data: eventsData } = await supabase
    .from("events")
    .select("slug, name, event_type, status, courses(name)")
    .in("status", ["scheduled", "in_progress"])
    .eq("public_scoreboard", true)
    .order("updated_at", { ascending: false })
    .limit(12);
  const events = ((eventsData ?? []) as unknown as EventRow[]);

  const { data: localData } = await supabase
    .from("leaderboard_entries")
    .select("profile_id, rank, points, verified, scope, profiles(display_name, city, state)")
    .eq("scope", "local")
    .order("rank", { ascending: true })
    .limit(40);
  const local = dedupeByPlayer((localData ?? []) as unknown as RankRow[], 10);

  let regional: RankRow[] = [];
  if (hasPro(tier)) {
    const { data: regData } = await supabase
      .from("leaderboard_entries")
      .select("profile_id, rank, points, verified, scope, profiles(display_name, city, state)")
      .in("scope", ["state", "national"])
      .order("rank", { ascending: true })
      .limit(60);
    regional = dedupeByPlayer((regData ?? []) as unknown as RankRow[], 20);
  }

  return (
    <PortalShell active="/golfer/leaderboards">
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>Leaderboards</h1>

      <SectionTitle>Live scoreboards</SectionTitle>
      {events.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No live events right now.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {events.map((e) => (
            <Link key={e.slug} href={`/live/${e.slug}`} className="card" style={{ padding: "1rem 1.25rem", textDecoration: "none" }}>
              <span style={{ fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: e.status === "in_progress" ? "var(--brand)" : "var(--muted)" }}>
                {e.status === "in_progress" ? "● Live" : "Scheduled"} · {e.event_type}
              </span>
              <p style={{ fontWeight: 700, color: "var(--text)", marginTop: "0.35rem" }}>{e.name}</p>
              {e.courses && <p style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: "0.15rem" }}>{e.courses.name}</p>}
            </Link>
          ))}
        </div>
      )}

      <SectionTitle>Local rankings</SectionTitle>
      <RankTable rows={local} />

      <SectionTitle>State &amp; national rankings</SectionTitle>
      {hasPro(tier) ? (
        <RankTable rows={regional} />
      ) : (
        <Notice
          title="State & national rankings are a Clubhouse Pro feature"
          body="Upgrade to Clubhouse Pro to see where you stand across your state and the country."
          cta={{ href: "/golfer#pricing", label: "See plans" }}
        />
      )}
    </PortalShell>
  );
}
