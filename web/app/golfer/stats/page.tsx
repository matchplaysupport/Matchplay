import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { calculateCareerStats, type StatRound } from "@/lib/careerStats";
import SignOutButton from "./SignOutButton";

export const metadata = {
  title: "Stats & Handicap · The Clubhouse",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/golfer" style={{ fontWeight: 800, color: "var(--text)", fontSize: "1.05rem" }}>
          The Clubhouse
        </Link>
        <SignOutButton />
      </header>
      <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>{children}</main>
    </div>
  );
}

function Notice({ title, body, cta }: { title: string; body: string; cta?: { href: string; label: string } }) {
  return (
    <div className="card" style={{ padding: "2.5rem", textAlign: "center", maxWidth: 520, margin: "3rem auto" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>{title}</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: cta ? "1.5rem" : 0 }}>{body}</p>
      {cta && (
        <Link href={cta.href} className="btn btn-primary">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "1.9rem", fontWeight: 800, color: accent ? "var(--brand)" : "var(--text)", lineHeight: 1 }}>
        {value}
      </p>
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
        // Lower differential is better, so invert so best rounds rise tallest.
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <Notice
          title="Sign in to view your stats"
          body="Sign in to see your Clubhouse Estimate, scoring trends, and round-by-round stats."
          cta={{ href: "/golfer/login", label: "Sign in" }}
        />
      </Shell>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    return (
      <Shell>
        <Notice
          title="Finish setting up your profile"
          body="Complete onboarding in the app to start tracking your handicap and stats."
        />
      </Shell>
    );
  }

  const { data: ent } = await supabase
    .from("subscription_entitlements")
    .select("entitlement")
    .eq("profile_id", profile.id)
    .single();

  const tier = ent?.entitlement ?? "free";
  if (tier !== "plus" && tier !== "pro") {
    return (
      <Shell>
        <Notice
          title="Stats & Handicap is a Match Play+ feature"
          body="Upgrade to Match Play+ to track your Clubhouse Estimate, scoring trends, and round-by-round stats."
          cta={{ href: "/golfer#pricing", label: "See plans" }}
        />
      </Shell>
    );
  }

  const { data: rounds } = await supabase
    .from("rounds")
    .select(
      "id, holes, verification_state, submitted_at, created_at, round_holes(hole_number, gross_score, putts, fairway, green_in_regulation, penalty_strokes)",
    )
    .eq("profile_id", profile.id);

  const stats = calculateCareerStats((rounds as StatRound[] | null) ?? []);

  if (stats.eligibleRounds === 0) {
    return (
      <Shell>
        <Notice
          title="No stats yet"
          body="Play and submit a round in the app to start building your Clubhouse Estimate and stats."
        />
      </Shell>
    );
  }

  const { handicap } = stats;

  return (
    <Shell>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", marginBottom: "1.5rem" }}>
        {profile.display_name}&apos;s stats
      </h1>

      {/* Handicap hero */}
      <div
        className="card"
        style={{ padding: "1.75rem 2rem", background: "var(--grad-brand, var(--brand))", color: "#fff", marginBottom: "1.5rem" }}
      >
        <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.85 }}>
          Clubhouse Estimate
        </span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "0.5rem" }}>
          <span style={{ fontSize: "3.4rem", fontWeight: 800, lineHeight: 1 }}>{handicap.value?.toFixed(1) ?? "—"}</span>
          <span style={{ fontSize: "0.8rem", opacity: 0.85, textAlign: "right" }}>
            {handicap.roundsUsed} of {stats.eligibleRounds} rounds
            <br />
            used in estimate
          </span>
        </div>
        <p style={{ fontSize: "0.82rem", opacity: 0.85, marginTop: "1rem", lineHeight: 1.5 }}>{handicap.explanation}</p>
      </div>

      {/* Trend */}
      {stats.trend.length >= 2 && (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>Handicap trend</h2>
          <TrendChart points={stats.trend.slice(-12)} />
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.75rem" }}>
            Differential per round (taller is better). Newest on the right.
          </p>
        </div>
      )}

      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
        <StatCard label="Scoring avg" value={formatRelative(stats.scoringAverage)} />
        <StatCard label="Putts / hole" value={stats.averagePutts?.toFixed(1) ?? "—"} />
        <StatCard label="Fairways" value={stats.fairwaysHitPct != null ? `${stats.fairwaysHitPct}%` : "—"} />
        <StatCard label="GIR" value={stats.greensInRegulationPct != null ? `${stats.greensInRegulationPct}%` : "—"} accent />
        <StatCard label="Best round" value={stats.bestGross ? String(stats.bestGross.grossScore) : "—"} />
        <StatCard label="Rounds" value={String(stats.roundsPlayed)} />
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "1.5rem", lineHeight: 1.6 }}>
        The Clubhouse Estimate is calculated from your submitted rounds and is not an official USGA Handicap Index.
        Verify rounds with partners to qualify for leaderboards.
      </p>
    </Shell>
  );
}
