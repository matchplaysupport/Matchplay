import { ImageResponse } from "next/og";

export const alt = "Match Play — Book the tee time. Keep the score.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "72px 80px",
          background: "linear-gradient(150deg, #0C3A22 0%, #0E5230 55%, #15864A 100%)",
          color: "#fff", fontFamily: "sans-serif",
        }}
      >
        {/* top: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#22A85B,#15803D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>⛳️</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>Match Play</div>
        </div>

        {/* middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>Book the tee time.</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, color: "#EFC04A" }}>Keep the score.</div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.78)", marginTop: 18, maxWidth: 820 }}>
            Zero-commission golf booking with match-play scoring, handicaps, and leaderboards built in.
          </div>
        </div>

        {/* bottom: chips */}
        <div style={{ display: "flex", gap: 14 }}>
          {["0% commission", "iOS + Android", "Instant Stripe payouts"].map((t) => (
            <div key={t} style={{ display: "flex", fontSize: 24, fontWeight: 600, padding: "10px 22px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
