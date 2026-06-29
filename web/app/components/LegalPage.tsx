import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" aria-label="The Clubhouse home"><Logo size={44} onDark={false} /></Link>
          <Link href="/" className="text-sm font-medium hover:text-[var(--brand)]" style={{ color: "var(--text-2)" }}>← Back to home</Link>
        </div>
      </header>

      <main className="container py-14 sm:py-20 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>{title}</h1>
        <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Last updated {updated}</p>
        <div className="legal mt-10">{children}</div>
        <div className="mt-12 rounded-xl p-4 text-xs" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
          This document is a starting template provided for launch. Have it reviewed by qualified legal counsel before relying on it.
        </div>
      </main>

      <footer className="border-t mt-auto" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="container py-6 text-xs" style={{ color: "var(--muted)" }}>
          © {new Date().getFullYear()} The Clubhouse. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-sora)" }}>{heading}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed" style={{ color: "var(--text-2)" }}>{children}</div>
    </section>
  );
}
