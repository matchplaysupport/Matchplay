import { PortalShell, Notice, ProfileSetupNotice } from "../_components/PortalShell";
import { loadGolfer, hasPlus } from "@/lib/golfer-session";
import { calculateCareerStats, type StatRound } from "@/lib/careerStats";

export const metadata = { title: "Games & Handicap · The Clubhouse" };

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
        {label}
      </p>
      <p style={{ fontSize: "1.9rem", fontWeight: 800, color: accent ? "var(--brand)" : "var(--text)", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function formatRelative(value: number | null): string {
  if (value == null) return "—";
  if (value === 0) return "E";
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

function TrendChart({ points }: { points: { roundId: string; differential: number }[] }) {
  const values = points.map((p) => p.differential);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 6, height: 120 }}>
      {points.map((pt) => {
        const heightPct = 25 + 75 * (1 - (pt.differential - min) / span);
        return (
          <div key={pt.roundId} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
            <div style={{ width: "70%", height: `${heightPct}%`, background: "var(--brand)", borderRadius: 4, minHeight: 4 }} />
            <span style={{ fontSize: "0.62rem", color: "var(--muted)" }}>{pt.differential.toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function GolferStatsPage() {
  const { supabase, profile, tier } = await loadGolfer();

  if (!profile) {
    return <PortalShell active="/golfer/stats"><ProfileSetupNotice /></PortalShell>;
  }

  if (!hasPlus(tier)) {
    return (
      <PortalShell active="/golfer/stats">
        <Notice
          title="Games & Handicap is a Clubhouse+ feature"
          body="Upgrade to Clubhouse+ to track your Clubhouse Estimate, scoring trends, and round-by-round history."
          cta={{ href: "/golfer#pricing", label: "See plans" }}
        />
      </PortalShell>
    );
  }

  const { data: rounds } = await supabase
    .from("rounds")
    .select("id, holes, verification_state, submitted_at, created_at, round_holes(hole_number, gross_score, putts, fairway, green_in_regulation, penalty_strokes)")
    .eq("profile_id", profile.id);

  const statRounds = (rounds as StatRound[] | null) ?? [];
  const stats = calculateCareerStats(statRounds);

  if (stats.eligibleRounds === 0) {
    return (
      <PortalShell active="/golfer/stats">
        <Notice title="No games yet" body="Play and submit a round in the app to start building your Clubhouse Estimate and history." />
      </PortalShell>
    );
  }

  const { handicap } = stats;
  const diffByRound = new Map(stats.trend.map((t) => [t.roundId, t.differential]));
  const games = statRounds
    .filter((r) => r.round_holes.length >= 9)
    .map((r) => ({
      id: r.id,
      when: r.submitted_at ?? r.created_at,
      holes: r.holes,
      gross: r.round_holes.reduce((s, h) => s + h.gross_score, 0),
      differential: diffByRound.get(r.id) ?? null,
    }))
    .sort((a, b) => (a.when < b.when ? 1 : -1))
    .slice(0, 15);

  return (
    <PortalShell active="/golfer/stats">
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", marginBottom: "1.5rem" }}>
        {profile.display_name}&apos;s games &amp; handicap
      </h1>

      <div className="card" style={{ padding: "1.75rem 2rem", background: "var(--grad-brand, var(--brand))", color: "#fff", marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.85 }}>Clubhouse Estimate</span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "0.5rem" }}>
          <span style={{ fontSize: "3.4rem", fontWeight: 800, lineHeight: 1 }}>{handicap.value?.toFixed(1) ?? "—"}</span>
          <span style={{ fontSize: "0.8rem", opacity: 0.85, textAlign: "right" }}>
            {handicap.roundsUsed} of {stats.eligibleRounds} rounds<br />used in estimate
          </span>
        </div>
        <p style={{ fontSize: "0.82rem", opacity: 0.85, marginTop: "1rem", lineHeight: 1.5 }}>{handicap.explanation}</p>
      </div>

      {stats.trend.length >= 2 && (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>Handicap trend</h2>
          <TrendChart points={stats.trend.slice(-12)} />
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.75rem" }}>Differential per round (taller is better). Newest on the right.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
        <StatCard label="Scoring avg" value={formatRelative(stats.scoringAverage)} />
        <StatCard label="Putts / hole" value={stats.averagePutts?.toFixed(1) ?? "—"} />
        <StatCard label="Fairways" value={stats.fairwaysHitPct != null ? `${stats.fairwaysHitPct}%` : "—"} />
        <StatCard label="GIR" value={stats.greensInRegulationPct != null ? `${stats.greensInRegulationPct}%` : "—"} accent />
        <StatCard label="Best round" value={stats.bestGross ? String(stats.bestGross.grossScore) : "—"} />
        <StatCard label="Rounds" value={String(stats.roundsPlayed)} />
      </div>

      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", margin: "2rem 0 1rem" }}>Previous games</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {games.map((g) => (
          <div key={g.id} className="card" style={{ padding: "0.8rem 1.1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
                {new Date(g.when).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </p>
              <p style={{ fontSize: "0.74rem", color: "var(--muted)" }}>{g.holes} holes{g.differential != null ? ` · diff ${g.differential.toFixed(1)}` : ""}</p>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)" }}>{g.gross}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "1.5rem", lineHeight: 1.6 }}>
        The Clubhouse Estimate is calculated from your submitted rounds and is not an official USGA Handicap Index.
        Verify rounds with partners to qualify for leaderboards.
      </p>
    </PortalShell>
  );
}
