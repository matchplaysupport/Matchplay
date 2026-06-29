"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTournament } from "./actions";

const field: React.CSSProperties = {
  padding: "0.6rem 0.8rem", borderRadius: 10, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontSize: "0.9rem", outline: "none", width: "100%",
};
const labelStyle: React.CSSProperties = { fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", marginBottom: "0.3rem", display: "block" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

export default function CreateTournamentForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [f, setF] = useState({
    name: "", format: "scramble", startsAt: "", holes: 18, maxPlayers: 16,
    buyIn: 0, prizeDistribution: "no_prize", courseName: "", description: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createTournament({
        name: f.name,
        format: f.format,
        startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : "",
        holes: Number(f.holes),
        maxPlayers: Number(f.maxPlayers),
        buyInCents: Math.round(Number(f.buyIn) * 100),
        prizeDistribution: f.prizeDistribution,
        courseName: f.courseName,
        description: f.description,
      });
      if (res.ok) router.push("/golfer/tournaments");
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 560 }}>
      <Row label="Event name">
        <input required value={f.name} onChange={set("name")} placeholder="Saturday Scramble" style={field} />
      </Row>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Row label="Format">
          <select value={f.format} onChange={set("format")} style={field}>
            <option value="scramble">Scramble</option>
            <option value="stroke_play">Stroke play</option>
            <option value="match_play">Match play</option>
            <option value="stableford">Stableford</option>
          </select>
        </Row>
        <Row label="Holes">
          <select value={f.holes} onChange={set("holes")} style={field}>
            <option value={18}>18 holes</option>
            <option value={9}>9 holes</option>
          </select>
        </Row>
      </div>
      <Row label="Start date & time">
        <input type="datetime-local" required value={f.startsAt} onChange={set("startsAt")} style={field} />
      </Row>
      <Row label="Course (optional)">
        <input value={f.courseName} onChange={set("courseName")} placeholder="Pebble Beach Golf Links" style={field} />
      </Row>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Row label="Max players">
          <input type="number" min={2} max={144} value={f.maxPlayers} onChange={set("maxPlayers")} style={field} />
        </Row>
        <Row label="Buy-in ($)">
          <input type="number" min={0} step={1} value={f.buyIn} onChange={set("buyIn")} style={field} />
        </Row>
      </div>
      <Row label="Prizes">
        <select value={f.prizeDistribution} onChange={set("prizeDistribution")} style={field}>
          <option value="no_prize">No prize</option>
          <option value="winner_takes_all">Winner takes all</option>
          <option value="top3_split">Top 3 split</option>
        </select>
      </Row>
      <Row label="Description (optional)">
        <textarea value={f.description} onChange={set("description")} rows={3} placeholder="Format details, meeting spot, etc." style={{ ...field, resize: "vertical" }} />
      </Row>

      {error && (
        <p style={{ fontSize: "0.8rem", color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "0.5rem 0.75rem" }}>{error}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: "100%", opacity: pending ? 0.7 : 1 }}>
        {pending ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
