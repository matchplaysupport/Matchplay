"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { IconMenu, IconX, IconSun, IconMoon } from "./icons";
import { useTheme } from "./ThemeProvider";
import { track } from "../../lib/track";

type NavLink = { href: string; label: string };

const DEFAULT_LINKS: NavLink[] = [
  { href: "#how", label: "How it works" },
  { href: "#golfers", label: "For Golfers" },
  { href: "#courses", label: "For Courses" },
  { href: "#savings", label: "Savings" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

interface NavProps {
  links?: NavLink[];
  ctaHref?: string;
  ctaLabel?: string;
  logoHref?: string;
}

export function Nav({
  links = DEFAULT_LINKS,
  ctaHref = "#waitlist",
  ctaLabel = "Join the waitlist",
  logoHref = "#top",
}: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? dark ? "rgba(8,15,11,0.95)" : "rgba(250,252,249,0.95)"
          : "linear-gradient(180deg, rgba(6,13,9,0.72) 0%, rgba(6,13,9,0) 100%)",
        backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div className="container flex items-center justify-between h-16 sm:h-[68px]">
        <a href={logoHref} aria-label="The Clubhouse home"><Logo size={30} light={!scrolled} /></a>

        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:text-[var(--brand)]"
              style={{ color: scrolled ? "var(--text-2)" : "rgba(244,239,227,0.86)" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Dark / light toggle */}
          <button
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
            style={scrolled
              ? { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }
              : { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff" }}
          >
            {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          <a
            href={ctaHref}
            onClick={() => track("nav_cta_click")}
            className="btn btn-primary hidden sm:inline-flex"
            style={{ padding: "0.6rem 1.15rem", fontSize: "0.875rem" }}
          >
            {ctaLabel}
          </a>

          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl"
            style={scrolled
              ? { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }
              : { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff" }}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden fixed inset-0 top-16 z-40" style={{ background: "var(--bg)" }}>
          <div className="container py-6 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3.5 text-lg font-semibold border-b"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                {l.label}
              </a>
            ))}
            <a
              href={ctaHref}
              onClick={() => { setOpen(false); track("nav_cta_click", { source: "mobile" }); }}
              className="btn btn-primary mt-5 w-full"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
