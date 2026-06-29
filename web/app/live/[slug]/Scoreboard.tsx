"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  computeScoreboard,
  formatPosition,
  formatThru,
  formatToPar,
  type BoardParticipant,
  type BoardScore,
  type HolePars,
} from "@/lib/scoreboard";

interface Props {
  eventId: string;
  eventName: string;
  status: string;
  holes: number;
  participants: BoardParticipant[];
  pars: HolePars;
  initialScores: BoardScore[];
}

const scoreKey = (s: { participantId: string; holeNumber: number }) =>
  `${s.participantId}:${s.holeNumber}`;

export default function Scoreboard({
  eventId,
  eventName,
  status,
  holes,
  participants,
  pars,
  initialScores,
}: Props) {
  const [scores, setScores] = useState<BoardScore[]>(initialScores);
  const [connected, setConnected] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`live:${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_scores", filter: `event_id=eq.${eventId}` },
        (payload) => {
          const row = payload.new as { participant_id: string; hole_number: number; strokes: number } | null;
          if (!row?.participant_id) return;
          const incoming: BoardScore = {
            participantId: row.participant_id,
            holeNumber: row.hole_number,
            strokes: row.strokes,
          };
          setScores((prev) => {
            const next = prev.filter((s) => scoreKey(s) !== scoreKey(incoming));
            next.push(incoming);
            return next;
          });
        },
      )
      .subscribe((s) => setConnected(s === "SUBSCRIBED"));

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  const board = useMemo(
    () => computeScoreboard(participants, scores, pars),
    [participants, scores, pars],
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <header style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: connected ? "var(--brand-bright)" : "var(--muted)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: connected ? "var(--brand-bright)" : "var(--muted)",
                }}
              />
              {connected ? "Live" : "Connecting"}
            </span>
            <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "capitalize" }}>
              {status.replace("_", " ")}
            </span>
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>{eventName}</h1>
        </header>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r)",
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "52px 1fr 56px 64px",
              padding: "10px 16px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              color: "var(--muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span>Pos</span>
            <span>Player</span>
            <span style={{ textAlign: "center" }}>Thru</span>
            <span style={{ textAlign: "right" }}>Score</span>
          </div>

          {board.length === 0 && (
            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--muted)" }}>
              No players yet.
            </div>
          )}

          {board.map((row) => (
            <div
              key={row.participantId}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr 56px 64px",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid var(--surface-2)",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--text-2)" }}>{formatPosition(row, board)}</span>
              <span style={{ fontWeight: 600 }}>{row.displayName}</span>
              <span style={{ textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                {formatThru(row.thru, holes)}
              </span>
              <span
                style={{
                  textAlign: "right",
                  fontWeight: 800,
                  color: row.toPar < 0 ? "var(--brand)" : "var(--text)",
                }}
              >
                {formatToPar(row.toPar)}
              </span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: "1rem", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Free live scoring for junior golfers &amp; student athletes · The Clubhouse
        </p>
      </div>
    </main>
  );
}
