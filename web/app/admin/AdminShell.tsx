"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "⊡" },
  { href: "/admin/tee-sheet", label: "Tee Sheet", icon: "📅" },
  { href: "/admin/bookings", label: "Bookings", icon: "✓" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminShell({
  children,
  email,
  courseName,
}: {
  children: React.ReactNode;
  email: string;
  courseName: string | null;
  courseId: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>⛳</span>
            <span style={{ fontWeight: 700, color: "var(--brand)", fontSize: "0.95rem" }}>The Clubhouse</span>
          </div>
          {courseName ? (
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 600, lineHeight: 1.3 }}>{courseName}</p>
          ) : (
            <p style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 600 }}>Setup required →</p>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0.75rem" }}>
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.55rem 0.75rem",
                  borderRadius: 8,
                  marginBottom: 2,
                  fontWeight: active ? 600 : 400,
                  fontSize: "0.875rem",
                  color: active ? "var(--brand)" : "var(--text-2)",
                  background: active ? "rgba(26,122,69,0.08)" : "transparent",
                  textDecoration: "none",
                }}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.73rem", color: "var(--muted)", marginBottom: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {email}
          </p>
          <button
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            style={{
              width: "100%", padding: "0.45rem", borderRadius: 8, border: "1px solid var(--border)",
              background: "transparent", color: "var(--muted)", fontSize: "0.8rem",
              cursor: "pointer", fontWeight: 500,
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
