import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { calculateCareerStats, type StatRound } from "@/lib/careerStats";
import { IconTrophy, IconFlag, IconChevron, IconUsers } from "../../components/icons";
import SignOutButton from "../stats/SignOutButton";

export const metadata = {
  title: "Dashboard · The Clubhouse",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const FORMAT_LABEL: Record<string, string> = {
  stroke_play: "Stroke Play",
  match_play: "Match Play",
  stableford: "Stableford",
  scramble: "Scramble",
};

/** "Jackson Shelley" → "J. Shelley"; single word passes through. */
function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

function initial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

function formatTournamentDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Presentational pieces ─────────────────────────────────────────────────────

function NavTab({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <a
      href={href}
      className="text-sm font-medium transition-colors hover:text-[var(--text)]"
      style={{ color: active ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap" }}
    >
      {label}
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[0.68rem] font-bold uppercase"
      style={{ color: "var(--muted)", letterSpacing: "0.14em" }}
    >
      {children}
    </span>
  );
}

function BigStat({ label, value, accent, href, hint }: {
  label: string; value: string; accent?: boolean; href?: string; hint?: string;
}) {
  const inner = (
    <>
      <SectionLabel>{label}</SectionLabel>
      <span
        className="font-extrabold leading-none"
        style={{
          fontFamily: "var(--font-sora)",
          fontSize: "clamp(2.4rem, 6vw, 3.2rem)",
          color: accent ? "var(--gold)" : "var(--text)",
        }}
      >
        {value}
      </span>
      {hint && (
        <span className="text-xs font-semibold mt-auto" style={{ color: "var(--gold)" }}>{hint}</span>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="card card-hover p-5 sm:p-6 flex flex-col gap-3">
        {inner}
      </Link>
    );
  }
  return <div className="card p-5 sm:p-6 flex flex-col gap-3">{inner}</div>;
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm py-2" style={{ color: "var(--muted)" }}>
      {children}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GolferDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/golfer/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, handicap_value")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    return (
      <main className="theme-club" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Finish setting up your profile</h1>
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            Complete onboarding in the app to unlock your dashboard.
          </p>
        </div>
      </main>
    );
  }

  // ── Handicap (Clubhouse Estimate) ──
  const { data: rounds } = await supabase
    .from("rounds")
    .select(
      "id, holes, verification_state, submitted_at, created_at, round_holes(hole_number, gross_score, putts, fairway, green_in_regulation, penalty_strokes)",
    )
    .eq("profile_id", profile.id);

  const stats = calculateCareerStats((rounds as StatRound[] | null) ?? []);
  const handicapValue =
    stats.handicap.value != null
      ? stats.handicap.value.toFixed(1)
      : profile.handicap_value != null
        ? Number(profile.handicap_value).toFixed(1)
        : "—";

  // ── Live rank (best standing across leaderboards) ──
  const { data: myRankRows } = await supabase
    .from("leaderboard_entries")
    .select("rank, scope, period, category")
    .eq("profile_id", profile.id)
    .order("rank", { ascending: true })
    .limit(1);
  const myRank = myRankRows?.[0];

  // ── Upcoming match (next open game I'm in) ──
  const nowIso = new Date().toISOString();
  const { data: myMemberships } = await supabase
    .from("open_game_members")
    .select("open_game_id")
    .eq("profile_id", profile.id)
    .eq("status", "accepted");
  const memberGameIds = (myMemberships ?? []).map((m) => m.open_game_id);
  const gameIdFilter = [...new Set([...memberGameIds])];

  // Games I created OR am an accepted member of, upcoming, earliest first.
  let upcomingGameQuery = supabase
    .from("open_games")
    .select("id, starts_at, course_id, creator_id, visibility")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(1);
  upcomingGameQuery = gameIdFilter.length
    ? upcomingGameQuery.or(`creator_id.eq.${profile.id},id.in.(${gameIdFilter.join(",")})`)
    : upcomingGameQuery.eq("creator_id", profile.id);
  const { data: upcomingGames } = await upcomingGameQuery;
  const match = upcomingGames?.[0];

  let matchCourseName: string | null = null;
  let matchOpponent: string | null = null;
  if (match) {
    const [{ data: course }, { data: members }] = await Promise.all([
      match.course_id
        ? supabase.from("courses").select("name").eq("id", match.course_id).single()
        : Promise.resolve({ data: null }),
      supabase
        .from("open_game_members")
        .select("profile_id, profiles(display_name)")
        .eq("open_game_id", match.id)
        .eq("status", "accepted"),
    ]);
    matchCourseName = (course as { name: string } | null)?.name ?? null;
    const others = (members ?? [])
      .filter((m) => m.profile_id !== profile.id)
      .map((m) => (m.profiles as { display_name: string } | null)?.display_name)
      .filter((n): n is string => Boolean(n));
    if (others.length === 1) matchOpponent = others[0];
    else if (others.length > 1) matchOpponent = `${others[0]} +${others.length - 1}`;
  }

  // ── My tournaments ──
  const { data: myEntries } = await supabase
    .from("tournament_players")
    .select("tournament_id")
    .eq("player_id", profile.id);
  const tournamentIds = (myEntries ?? []).map((e) => e.tournament_id);
  const { data: myTournaments } = tournamentIds.length
    ? await supabase
        .from("tournaments")
        .select("id, name, starts_at, format, status")
        .in("id", tournamentIds)
        .in("status", ["open", "in_progress"])
        .order("starts_at", { ascending: true })
        .limit(3)
    : { data: [] };

  // ── Leaderboard (top of my best scope, else any top) ──
  let lbQuery = supabase
    .from("leaderboard_entries")
    .select("rank, points, profile_id, profiles(display_name)")
    .order("rank", { ascending: true })
    .limit(5);
  if (myRank) lbQuery = lbQuery.eq("scope", myRank.scope).eq("period", myRank.period).eq("category", myRank.category);
  const { data: leaderboard } = await lbQuery;

  const navTabs = [
    { href: "#top", label: "Dashboard", active: true },
    { href: "#tournaments", label: "Tournaments" },
    { href: "#matches", label: "Matches" },
    { href: "#leaderboard", label: "Leaderboards" },
    { href: "/golfer", label: "Tee Times" },
  ];

  return (
    <main id="top" className="theme-club" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-20"
        style={{ background: "rgba(10,19,14,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-7 min-w-0">
            <Link href="/golfer" className="font-bold shrink-0" style={{ color: "var(--text)", letterSpacing: "0.04em" }}>
              THE CLUBHOUSE
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navTabs.map((t) => (
                <NavTab key={t.label} {...t} />
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--grad-brand)", color: "#fff" }}
            >
              {initial(profile.display_name)}
            </span>
            <span className="hidden sm:inline text-sm font-medium" style={{ color: "var(--text)" }}>
              {profile.display_name.split(/\s+/)[0]}
            </span>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1
          className="text-2xl font-extrabold mb-6"
          style={{ fontFamily: "var(--font-sora)", color: "var(--text)", letterSpacing: "0.12em" }}
        >
          DASHBOARD
        </h1>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Left column */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <BigStat label="Handicap" value={handicapValue} href="/golfer/stats" hint="Full stats →" />
              <BigStat label="Live Rank" value={myRank ? String(myRank.rank) : "—"} accent />
            </div>

            {/* My tournaments */}
            <section id="tournaments" className="card p-5 sm:p-6" style={{ scrollMarginTop: "80px" }}>
              <SectionLabel>My Tournaments</SectionLabel>
              <div className="mt-4 flex flex-col">
                {(myTournaments ?? []).length === 0 && (
                  <EmptyRow>You haven&apos;t joined a tournament yet.</EmptyRow>
                )}
                {(myTournaments ?? []).map((t, i, arr) => (
                  <Link
                    key={t.id}
                    href="/golfer/dashboard#tournaments"
                    className="flex items-center gap-3.5 py-3.5"
                    style={i < arr.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "var(--surface-3)", color: "var(--brand-bright)" }}
                    >
                      {t.format === "scramble" ? <IconUsers size={17} /> : <IconTrophy size={17} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{t.name}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {formatTournamentDate(t.starts_at)} · {FORMAT_LABEL[t.format] ?? t.format}
                      </div>
                    </div>
                    <span style={{ color: "var(--muted)" }}><IconChevron size={18} /></span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Upcoming match */}
            <section id="matches" className="card p-5 sm:p-6" style={{ scrollMarginTop: "80px" }}>
              <SectionLabel>Upcoming Match</SectionLabel>
              {match ? (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-bold truncate" style={{ color: "var(--text)" }}>
                      {matchOpponent ? `vs. ${matchOpponent}` : "Open game"}
                    </div>
                    <div className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
                      {formatMatchDate(match.starts_at)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {matchCourseName ?? "Match"}
                    </div>
                  </div>
                  <Link href="/golfer/dashboard#matches" className="btn btn-gold shrink-0" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                    View match
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyRow>No upcoming matches scheduled.</EmptyRow>
                  <Link href="/golfer" className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
                    Find a game →
                  </Link>
                </div>
              )}
            </section>

            {/* Leaderboard */}
            <section id="leaderboard" className="card p-5 sm:p-6 flex flex-col" style={{ scrollMarginTop: "80px" }}>
              <SectionLabel>Leaderboard</SectionLabel>
              <div className="mt-4 flex flex-col flex-1">
                {(leaderboard ?? []).length === 0 && (
                  <EmptyRow>No leaderboard standings yet — play a verified round to get ranked.</EmptyRow>
                )}
                {(leaderboard ?? []).map((row, i, arr) => {
                  const name = (row.profiles as { display_name: string } | null)?.display_name ?? "Player";
                  const isMe = row.profile_id === profile.id;
                  return (
                    <div
                      key={`${row.rank}-${row.profile_id}`}
                      className="flex items-center gap-3 py-2.5"
                      style={i < arr.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}
                    >
                      <span className="w-5 text-sm font-bold tabular-nums" style={{ color: "var(--muted)" }}>{row.rank}</span>
                      <span className="flex-1 text-sm font-medium truncate" style={{ color: isMe ? "var(--gold)" : "var(--text)" }}>
                        {shortName(name)}{isMe ? " (you)" : ""}
                      </span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: "var(--brand-bright)" }}>{row.points}</span>
                    </div>
                  );
                })}
              </div>
              <Link href="/golfer/dashboard#leaderboard" className="mt-4 text-sm font-semibold text-center" style={{ color: "var(--gold)" }}>
                View Full Leaderboard
              </Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
