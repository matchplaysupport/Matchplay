// Pure-markup product mockups (no image assets). Server-safe.
import { IconSearch, IconFlag, IconTrophy, IconUsers, IconCalendar, IconMapPin } from "./icons";

function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? "rgba(255,255,255,0.9)" : "var(--text)";
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold" style={{ color: c }}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span style={{ letterSpacing: "1px" }}>•••</span>
        <span style={{ width: 18, height: 9, borderRadius: 3, border: `1px solid ${c}`, display: "inline-block", position: "relative" }}>
          <span style={{ position: "absolute", inset: 1.5, right: 5, background: c, borderRadius: 1 }} />
        </span>
      </div>
    </div>
  );
}

function TeeCard({ time, ampm, course, miles, price, spots, featured }: {
  time: string; ampm: string; course: string; miles: string; price: string; spots: string; featured?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-3.5 flex items-center gap-3"
      style={
        featured
          ? { background: "var(--grad-brand)", boxShadow: "var(--shadow-glow)", color: "#fff" }
          : { background: "var(--surface)", border: "1px solid var(--border)" }
      }
    >
      <div className="text-center leading-none" style={{ minWidth: 46 }}>
        <div className="text-lg font-bold" style={{ fontFamily: "var(--font-sora)" }}>{time}</div>
        <div className="text-[10px] font-semibold opacity-70">{ampm}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{course}</div>
        <div className="text-[11px] flex items-center gap-1 opacity-70">
          <IconMapPin size={11} /> {miles} · {spots}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold">{price}</div>
        <div
          className="text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-md"
          style={featured ? { background: "rgba(255,255,255,0.22)" } : { background: "var(--surface-3)", color: "var(--brand)" }}
        >
          Book
        </div>
      </div>
    </div>
  );
}

export function PhoneMockup() {
  return (
    <div
      className="relative mx-auto"
      style={{ width: 300, height: 612, borderRadius: 46, padding: 11, background: "#0E1A12", boxShadow: "var(--shadow-lg)" }}
    >
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10" style={{ width: 110, height: 26, background: "#0E1A12", borderRadius: 999 }} />
      <div className="relative w-full h-full overflow-hidden flex flex-col" style={{ borderRadius: 36, background: "var(--bg)" }}>
        <StatusBar />
        {/* Header */}
        <div className="px-5 pt-2 pb-3">
          <div className="text-[22px] font-bold leading-tight" style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.03em" }}>
            Find a tee time
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <IconSearch size={15} className="opacity-50" />
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>Pebble Creek · within 10 mi</span>
          </div>
          <div className="mt-2.5 flex gap-1.5">
            {["Today", "2 players", "Morning"].map((c, i) => (
              <span key={c} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={i === 0 ? { background: "var(--brand)", color: "#fff" } : { background: "var(--surface-3)", color: "var(--brand)" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
        {/* List */}
        <div className="flex-1 px-4 flex flex-col gap-2.5 overflow-hidden">
          <TeeCard time="7:20" ampm="AM" course="Cypress Ridge GC" miles="3.1 mi" price="$48" spots="3 left" featured />
          <TeeCard time="8:04" ampm="AM" course="Pebble Creek" miles="5.0 mi" price="$62" spots="4 left" />
          <TeeCard time="9:12" ampm="AM" course="Highland Links" miles="6.7 mi" price="$39" spots="2 left" />
          <TeeCard time="10:40" ampm="AM" course="Augusta Muni" miles="8.2 mi" price="$55" spots="4 left" />
        </div>
        {/* Tab bar */}
        <div className="flex items-center justify-around px-2 pt-3 pb-5" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
          {[{ I: IconSearch, on: true, l: "Book" }, { I: IconFlag, on: false, l: "Play" }, { I: IconTrophy, on: false, l: "Compete" }, { I: IconUsers, on: false, l: "Profile" }].map(({ I, on, l }) => (
            <div key={l} className="flex flex-col items-center gap-1" style={{ color: on ? "var(--brand)" : "var(--muted)" }}>
              <I size={19} />
              <span className="text-[9px] font-semibold">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Compact scorecard card used as a floating accent near the hero phone. */
export function ScoreCardChip() {
  return (
    <div className="card p-4" style={{ width: 210 }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ fontFamily: "var(--font-sora)" }}>Match · Front 9</span>
        <span className="chip" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>LIVE</span>
      </div>
      <div className="mt-3 space-y-2">
        {[{ n: "You", s: "2 UP", lead: true }, { n: "M. Reyes", s: "—" }].map((r) => (
          <div key={r.n} className="flex items-center justify-between text-sm">
            <span className="font-medium" style={{ color: "var(--text-2)" }}>{r.n}</span>
            <span className="font-bold" style={{ color: r.lead ? "var(--brand)" : "var(--muted)" }}>{r.s}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
        <div className="h-full rounded-full" style={{ width: "66%", background: "var(--grad-brand)" }} />
      </div>
    </div>
  );
}

/** Course operator dashboard mockup. */
export function DashboardMockup() {
  const hours = ["6a", "8a", "10a", "12p", "2p", "4p"];
  const fill = [80, 95, 70, 88, 60, 92];
  return (
    <div className="card overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
      {/* top bar */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <span style={{ width: 9, height: 9, borderRadius: 99, background: "#ef6a5a" }} />
          <span style={{ width: 9, height: 9, borderRadius: 99, background: "#f0c44e" }} />
          <span style={{ width: 9, height: 9, borderRadius: 99, background: "var(--brand-bright)" }} />
        </div>
        <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Cypress Ridge · Tee Sheet</span>
        <IconCalendar size={15} className="opacity-50" />
      </div>
      <div className="p-5">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          {[{ v: "94%", l: "Today filled" }, { v: "$4,820", l: "Revenue" }, { v: "+18%", l: "vs last wk" }].map((k) => (
            <div key={k.l} className="rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
              <div className="text-lg font-bold grad-text" style={{ fontFamily: "var(--font-sora)" }}>{k.v}</div>
              <div className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{k.l}</div>
            </div>
          ))}
        </div>
        {/* Bar chart */}
        <div className="mt-5 flex items-end justify-between gap-2" style={{ height: 110 }}>
          {fill.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full rounded-t-md" style={{ height: `${h}%`, background: i === 1 ? "var(--grad-brand)" : "var(--surface-3)" }} />
              <span className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>{hours[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
