"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { dark: boolean; toggle: () => void };
const ThemeCtx = createContext<Ctx>({ dark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("mp-theme") === "light") setDark(false);
  }, []);

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem("mp-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      <div
        id="top"
        className={`${dark ? "theme-club" : ""} flex flex-col min-h-screen`}
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}
