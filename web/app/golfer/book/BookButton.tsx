"use client";

import { useState, useTransition } from "react";
import { bookTeeTime } from "./actions";

export default function BookButton({ teeTimeId, maxPlayers }: { teeTimeId: string; maxPlayers: number }) {
  const [players, setPlayers] = useState(1);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const cap = Math.min(4, Math.max(1, maxPlayers));

  function submit() {
    setResult(null);
    startTransition(async () => {
      const res = await bookTeeTime(teeTimeId, players);
      setResult(res.ok ? { ok: true, msg: `Confirmed · ${res.code}` } : { ok: false, msg: res.error });
    });
  }

  if (result?.ok) {
    return (
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand)", background: "rgba(26,122,69,0.1)", padding: "0.3rem 0.65rem", borderRadius: 999, whiteSpace: "nowrap" }}>
        {result.msg}
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <select
          aria-label="Players"
          value={players}
          onChange={(e) => setPlayers(Number(e.target.value))}
          disabled={pending}
          style={{ padding: "0.4rem 0.5rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "0.8rem" }}
        >
          {Array.from({ length: cap }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} player{n !== 1 ? "s" : ""}</option>
          ))}
        </select>
        <button onClick={submit} disabled={pending} className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem", opacity: pending ? 0.7 : 1 }}>
          {pending ? "Booking…" : "Book"}
        </button>
      </div>
      {result && !result.ok && (
        <span style={{ fontSize: "0.72rem", color: "#dc2626", maxWidth: 220, textAlign: "right" }}>{result.msg}</span>
      )}
    </div>
  );
}
