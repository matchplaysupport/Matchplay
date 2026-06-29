"use client";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";

// The Clubhouse primary logo — the full lockup (C-mark + wordmark + tagline),
// rendered as supplied. The finish follows the surface: the dark-background
// lockup on dark surfaces (default dark theme / hero), the cream one on light.
// `onDark` defaults to the active theme; pass it explicitly on surfaces that
// don't track the theme (the always-light legal/404 pages).

function useOnDark(onDark?: boolean) {
  const { dark } = useTheme();
  return onDark ?? dark;
}

export function Logo({ size = 44, onDark }: { size?: number; onDark?: boolean }) {
  const dark = useOnDark(onDark);
  return (
    <Image
      src={dark ? "/logo-dark.png" : "/logo-light.png"}
      alt="The Clubhouse — Play. Compete. Belong."
      width={size}
      height={size}
      priority
      style={{ borderRadius: Math.round(size * 0.14), objectFit: "cover", display: "block" }}
    />
  );
}

// Back-compat aliases — both render the full lockup.
export const LogoMark = Logo;
export const LogoLockup = Logo;
