import Link from "next/link";
import SignOutButton from "./SignOutButton";

const TABS = [
  { href: "/golfer/dashboard", label: "Dashboard" },
  { href: "/golfer/book", label: "Book" },
  { href: "/golfer/stats", label: "Games & Handicap" },
  { href: "/golfer/leaderboards", label: "Leaderboards" },
  { href: "/golfer/tournaments", label: "Tournaments" },
];

/** Shared chrome for the authed golfer portal — brand + tab nav + sign out. */
export function PortalShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0.9rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/golfer" style={{ fontWeight: 800, color: "var(--brand)", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
            The Clubhouse
          </Link>
          <nav style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
            {TABS.map((t) => {
              const on = active === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    padding: "0.4rem 0.7rem",
                    borderRadius: 8,
                    color: on ? "var(--brand)" : "var(--text-2)",
                    background: on ? "var(--surface-3)" : "transparent",
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>{children}</main>
    </div>
  );
}

/** Centered message card — used for empty states, "finish setup", and paywalls. */
export function Notice({ title, body, cta }: { title: string; body: string; cta?: { href: string; label: string } }) {
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

/** "Finish setup" notice for confirmed accounts with no profile row. */
export function ProfileSetupNotice() {
  return (
    <Notice
      title="Account setup incomplete"
      body="We couldn't find your golfer profile. Finish setting up in the mobile app, or contact support."
    />
  );
}
