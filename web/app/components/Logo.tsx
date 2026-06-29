"use client";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";

// Two ways to render the brand:
//   <Logo>        — horizontal lockup: the bare "C" mark + "The Clubhouse"
//                   wordmark. Use in tight chrome (nav, footers, headers).
//   <LogoLockup>  — the full primary logo (mark + wordmark + tagline baked in).
//                   Use standalone where there's room (footer brand block).
//
// Art finish follows the surface: on a dark surface we use the dark-background
// art so it blends; on light, the cream-background art. `onDark` defaults to the
// active theme (the marketing site is dark by default); pass it explicitly on
// surfaces that don't track the theme (e.g. the always-light legal/404 pages).

function useOnDark(onDark?: boolean) {
  const { dark } = useTheme();
  return onDark ?? dark;
}

export function LogoMark({ size = 32, onDark }: { size?: number; onDark?: boolean }) {
  const dark = useOnDark(onDark);
  return (
    <Image
      src={dark ? "/mark-dark.png" : "/mark-light.png"}
      alt="The Clubhouse"
      width={size}
      height={size}
      priority
      style={{ borderRadius: Math.round(size * 0.26), objectFit: "cover", display: "block" }}
    />
  );
}

export function Logo({ size = 32, light = false, onDark }: { size?: number; light?: boolean; onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} onDark={onDark} />
      <span
        className="font-bold tracking-tight"
        style={{
          fontFamily: "var(--font-sora)",
          fontSize: size * 0.6,
          color: light ? "#fff" : "var(--text)",
        }}
      >
        The Clubhouse
      </span>
    </span>
  );
}

export function LogoLockup({ size = 160, onDark }: { size?: number; onDark?: boolean }) {
  const dark = useOnDark(onDark);
  return (
    <Image
      src={dark ? "/logo-dark.png" : "/logo-light.png"}
      alt="The Clubhouse — Play. Compete. Belong."
      width={size}
      height={size}
      style={{ borderRadius: Math.round(size * 0.08), objectFit: "cover", display: "block" }}
    />
  );
}
