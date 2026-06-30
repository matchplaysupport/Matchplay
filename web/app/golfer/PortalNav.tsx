import Link from "next/link";
import SignOutButton from "./stats/SignOutButton";

function initial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

const TABS = [
  { key: "dashboard", href: "/golfer/dashboard", label: "Dashboard" },
  { key: "tournaments", href: "/golfer/dashboard#tournaments", label: "Tournaments" },
  { key: "matches", href: "/golfer/dashboard#matches", label: "Matches" },
  { key: "leaderboards", href: "/golfer/dashboard#leaderboard", label: "Leaderboards" },
  { key: "tee-times", href: "/golfer", label: "Tee Times" },
  { key: "profile", href: "/golfer/profile", label: "Profile" },
];

export function PortalNav({
  displayName,
  avatarUrl,
  active,
}: {
  displayName: string;
  avatarUrl?: string | null;
  active: string;
}) {
  return (
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
            {TABS.map((t) => (
              <a
                key={t.key}
                href={t.href}
                className="text-sm font-medium transition-colors hover:text-[var(--text)]"
                style={{ color: t.key === active ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap" }}
              >
                {t.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/golfer/profile" className="flex items-center gap-2.5">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" style={{ border: "1px solid var(--border-strong)" }} />
            ) : (
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--grad-brand)", color: "#fff" }}
              >
                {initial(displayName)}
              </span>
            )}
            <span className="hidden sm:inline text-sm font-medium" style={{ color: "var(--text)" }}>
              {displayName.split(/\s+/)[0]}
            </span>
          </Link>
          <span style={{ color: "var(--border-strong)" }}>·</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
