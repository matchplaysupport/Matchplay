import Link from "next/link";
import { PortalShell, Notice, ProfileSetupNotice } from "../_components/PortalShell";
import { loadGolfer, hasPro } from "@/lib/golfer-session";

export const metadata = { title: "Tournaments · The Clubhouse" };

type TournamentRow = {
  id: string;
  name: string;
  format: string;
  holes: number;
  max_players: number;
  buy_in_cents: number;
  starts_at: string;
  status: string;
  course_name: string | null;
  courses: { name: string } | null;
  tournament_players: { count: number }[];
};

const FORMAT_LABEL: Record<string, string> = {
  stroke_play: "Stroke play",
  match_play: "Match play",
  stableford: "Stableford",
  scramble: "Scramble",
};

export default async function TournamentsPage() {
  const { supabase, profile, tier } = await loadGolfer();
  if (!profile) {
    return <PortalShell active="/golfer/tournaments"><ProfileSetupNotice /></PortalShell>;
  }

  const { data } = await supabase
    .from("tournaments")
    .select("id, name, format, holes, max_players, buy_in_cents, starts_at, status, course_name, courses(name), tournament_players(count)")
    .in("status", ["open", "in_progress"])
    .order("starts_at", { ascending: true })
    .limit(30);
  const tournaments = ((data ?? []) as unknown as TournamentRow[]);

  return (
    <PortalShell active="/golfer/tournaments">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>Tournaments &amp; scrambles</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Browse open events, or host your own.</p>
        </div>
        {hasPro(tier) ? (
          <Link href="/golfer/tournaments/new" className="btn btn-primary" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>+ Create</Link>
        ) : (
          <Link href="/golfer#pricing" className="btn btn-ghost" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>Host with Pro →</Link>
        )}
      </div>

      <div style={{ marginTop: "1.75rem" }}>
        {tournaments.length === 0 ? (
          <Notice title="No open tournaments yet" body="Be the first to host one — create a tournament or scramble for your group." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {tournaments.map((t) => {
              const dt = new Date(t.starts_at);
              const players = t.tournament_players?.[0]?.count ?? 0;
              return (
                <Link key={t.id} href={`/golfer/tournaments/${t.id}`} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", textDecoration: "none" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{t.name}</p>
                      <span className="chip" style={{ background: "var(--surface-3)", color: "var(--brand)", fontSize: "0.66rem" }}>{FORMAT_LABEL[t.format] ?? t.format}</span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                      {(t.courses?.name ?? t.course_name) ? `${t.courses?.name ?? t.course_name} · ` : ""}
                      {dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {t.holes} holes
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>{players}/{t.max_players}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{t.buy_in_cents > 0 ? `$${(t.buy_in_cents / 100).toFixed(0)} buy-in` : "Free"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
