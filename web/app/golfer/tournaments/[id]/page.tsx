import Link from "next/link";
import { PortalShell, Notice, ProfileSetupNotice } from "../../_components/PortalShell";
import { loadGolfer } from "@/lib/golfer-session";
import JoinButton from "./JoinButton";

export const metadata = { title: "Tournament · The Clubhouse" };

const FORMAT_LABEL: Record<string, string> = {
  stroke_play: "Stroke play",
  match_play: "Match play",
  stableford: "Stableford",
  scramble: "Scramble",
};
const PRIZE_LABEL: Record<string, string> = {
  no_prize: "No prize",
  winner_takes_all: "Winner takes all",
  top3_split: "Top 3 split",
};

type Detail = {
  id: string;
  name: string;
  format: string;
  holes: number;
  max_players: number;
  buy_in_cents: number;
  prize_distribution: string;
  starts_at: string;
  status: string;
  description: string | null;
  course_name: string | null;
  creator_id: string;
  courses: { name: string; city: string; state: string } | null;
  tournament_players: { player_id: string; profiles: { display_name: string; city: string; state: string } | null }[];
};

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await loadGolfer();
  if (!profile) {
    return <PortalShell active="/golfer/tournaments"><ProfileSetupNotice /></PortalShell>;
  }

  const { data } = await supabase
    .from("tournaments")
    .select("id, name, format, holes, max_players, buy_in_cents, prize_distribution, starts_at, status, description, course_name, creator_id, courses(name, city, state), tournament_players(player_id, profiles(display_name, city, state))")
    .eq("id", id)
    .maybeSingle();
  const t = data as unknown as Detail | null;

  if (!t) {
    return (
      <PortalShell active="/golfer/tournaments">
        <Notice title="Tournament not found" body="This event may have been removed." cta={{ href: "/golfer/tournaments", label: "Back to tournaments" }} />
      </PortalShell>
    );
  }

  const players = t.tournament_players ?? [];
  const joined = players.some((p) => p.player_id === profile.id);
  const isHost = t.creator_id === profile.id;
  const full = players.length >= t.max_players;
  const dt = new Date(t.starts_at);

  return (
    <PortalShell active="/golfer/tournaments">
      <Link href="/golfer/tournaments" style={{ fontSize: "0.82rem", color: "var(--muted)" }}>← Back to tournaments</Link>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", margin: "0.6rem 0 0.25rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>{t.name}</h1>
        <span className="chip" style={{ background: "var(--surface-3)", color: "var(--brand)", fontSize: "0.66rem" }}>{FORMAT_LABEL[t.format] ?? t.format}</span>
        {t.status !== "open" && <span className="chip" style={{ background: "var(--surface-3)", color: "var(--muted)", fontSize: "0.66rem", textTransform: "capitalize" }}>{t.status.replace("_", " ")}</span>}
      </div>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        {(t.courses?.name ?? t.course_name) ? `${t.courses?.name ?? t.course_name} · ` : ""}
        {dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </p>

      <div className="card" style={{ padding: "1.25rem 1.5rem", margin: "1.5rem 0", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "1rem" }}>
        <div><p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Holes</p><p style={{ fontWeight: 700, color: "var(--text)" }}>{t.holes}</p></div>
        <div><p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Players</p><p style={{ fontWeight: 700, color: "var(--text)" }}>{players.length}/{t.max_players}</p></div>
        <div><p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Buy-in</p><p style={{ fontWeight: 700, color: "var(--text)" }}>{t.buy_in_cents > 0 ? `$${(t.buy_in_cents / 100).toFixed(0)}` : "Free"}</p></div>
        <div><p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Prize</p><p style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.85rem" }}>{PRIZE_LABEL[t.prize_distribution] ?? t.prize_distribution}</p></div>
      </div>

      {t.description && <p style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>{t.description}</p>}

      {/* Registration state */}
      <div style={{ marginBottom: "1.75rem" }}>
        {joined ? (
          <p style={{ fontWeight: 700, color: "var(--brand)" }}>{isHost ? "You're hosting this event." : "You're registered. ✓"}</p>
        ) : t.status !== "open" ? (
          <p style={{ color: "var(--muted)" }}>Registration is closed.</p>
        ) : full ? (
          <p style={{ color: "var(--muted)" }}>This event is full.</p>
        ) : (
          <JoinButton tournamentId={t.id} />
        )}
      </div>

      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>Players ({players.length})</h2>
      {players.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No players registered yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {players.map((p, i) => (
            <div key={p.player_id} className="card" style={{ padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.9rem" }}>
              <span style={{ fontWeight: 700, color: "var(--muted)", width: 24, textAlign: "center" }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
                  {p.profiles?.display_name ?? "Player"}
                  {p.player_id === t.creator_id && <span style={{ fontSize: "0.66rem", color: "var(--brand)", marginLeft: 6 }}>host</span>}
                </p>
                {p.profiles && <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{p.profiles.city}, {p.profiles.state}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
