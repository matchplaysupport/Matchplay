"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type TeeTimeRow = {
  id: string;
  starts_at: string;
  price_cents: number;
  available_spots: number;
  holes: number;
  cart_included: boolean;
  walking_allowed: boolean;
  cancellation_label: string;
};

type GenerateForm = {
  date: string;
  startTime: string;
  endTime: string;
  intervalMins: number;
  priceCents: number;
  holes: 9 | 18;
  availableSpots: number;
  cartIncluded: boolean;
  walkingAllowed: boolean;
  cancellationLabel: string;
};

const today = new Date().toISOString().slice(0, 10);

const DEFAULTS: GenerateForm = {
  date: today,
  startTime: "07:00",
  endTime: "14:00",
  intervalMins: 10,
  priceCents: 5900,
  holes: 18,
  availableSpots: 4,
  cartIncluded: false,
  walkingAllowed: true,
  cancellationLabel: "Free cancellation 24h before",
};

function Input({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.55rem 0.75rem", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontSize: "0.875rem", outline: "none",
  width: "100%",
};

const checkStyle: React.CSSProperties = { width: 16, height: 16, accentColor: "var(--brand)" };

export default function TeeSheetClient({
  courseId,
  initialTeeTimes,
}: {
  courseId: string;
  initialTeeTimes: TeeTimeRow[];
}) {
  const [teeTimes, setTeeTimes] = useState(initialTeeTimes);
  const [form, setForm] = useState<GenerateForm>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const set = <K extends keyof GenerateForm>(key: K, val: GenerateForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const generateSlots = (): Omit<TeeTimeRow, "id">[] => {
    const slots: Omit<TeeTimeRow, "id">[] = [];
    const [startH, startM] = form.startTime.split(":").map(Number);
    const [endH, endM] = form.endTime.split(":").map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    for (let m = startMins; m < endMins; m += form.intervalMins) {
      const h = Math.floor(m / 60).toString().padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      const startsAt = new Date(`${form.date}T${h}:${min}:00`);
      slots.push({
        starts_at: startsAt.toISOString(),
        price_cents: form.priceCents,
        available_spots: form.availableSpots,
        holes: form.holes,
        cart_included: form.cartIncluded,
        walking_allowed: form.walkingAllowed,
        cancellation_label: form.cancellationLabel,
      });
    }
    return slots;
  };

  const handleGenerate = async () => {
    const slots = generateSlots();
    if (slots.length === 0) { setError("No slots generated — check your times."); return; }
    if (slots.length > 60) { setError("Too many slots (max 60). Narrow your time range or increase the interval."); return; }

    setSaving(true);
    setError("");
    setSuccess("");
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("tee_times")
      .insert(slots.map((s) => ({ ...s, course_id: courseId, is_demo: false })))
      .select();

    if (err) { setError(err.message); setSaving(false); return; }
    setTeeTimes((prev) => [...prev, ...(data ?? [])].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    ));
    setSuccess(`Added ${data?.length ?? 0} tee times.`);
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("tee_times").delete().eq("id", id);
    setTeeTimes((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  };

  // Group by date
  const grouped = teeTimes.reduce<Record<string, TeeTimeRow[]>>((acc, t) => {
    const date = new Date(t.starts_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    (acc[date] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div style={{ padding: "2rem", maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>Tee Sheet</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.2rem" }}>
            {teeTimes.length} upcoming slot{teeTimes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((v) => !v)}
          style={{ fontSize: "0.875rem" }}
        >
          {showForm ? "Close" : "+ Add tee times"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1rem" }}>Generate tee times</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
            <Input label="Date">
              <input type="date" value={form.date} min={today} onChange={(e) => set("date", e.target.value)} style={inputStyle} />
            </Input>
            <Input label="Start time">
              <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} style={inputStyle} />
            </Input>
            <Input label="End time">
              <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} style={inputStyle} />
            </Input>
            <Input label="Interval (mins)">
              <select value={form.intervalMins} onChange={(e) => set("intervalMins", Number(e.target.value))} style={inputStyle}>
                {[8, 10, 12, 15, 20].map((n) => <option key={n} value={n}>{n} min</option>)}
              </select>
            </Input>
            <Input label="Price per golfer ($)">
              <input
                type="number" min={0} step={1}
                value={form.priceCents / 100}
                onChange={(e) => set("priceCents", Math.round(parseFloat(e.target.value) * 100))}
                style={inputStyle}
              />
            </Input>
            <Input label="Holes">
              <select value={form.holes} onChange={(e) => set("holes", Number(e.target.value) as 9 | 18)} style={inputStyle}>
                <option value={18}>18 holes</option>
                <option value={9}>9 holes</option>
              </select>
            </Input>
            <Input label="Available spots">
              <select value={form.availableSpots} onChange={(e) => set("availableSpots", Number(e.target.value))} style={inputStyle}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Input>
            <Input label="Cancellation policy">
              <select value={form.cancellationLabel} onChange={(e) => set("cancellationLabel", e.target.value)} style={inputStyle}>
                <option>Free cancellation 24h before</option>
                <option>Free cancellation 48h before</option>
                <option>Non-refundable</option>
              </select>
            </Input>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.cartIncluded} onChange={(e) => set("cartIncluded", e.target.checked)} style={checkStyle} />
              Cart included
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.walkingAllowed} onChange={(e) => set("walkingAllowed", e.target.checked)} style={checkStyle} />
              Walking allowed
            </label>
          </div>

          <div style={{ marginTop: "1rem", padding: "0.625rem 1rem", borderRadius: 8, background: "var(--surface-2)", fontSize: "0.8rem", color: "var(--muted)" }}>
            This will create <strong style={{ color: "var(--text)" }}>{generateSlots().length} tee time slot{generateSlots().length !== 1 ? "s" : ""}</strong> on {form.date}.
          </div>

          {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.75rem" }}>{error}</p>}
          {success && <p style={{ color: "var(--brand)", fontSize: "0.8rem", marginTop: "0.75rem" }}>{success}</p>}

          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-primary"
              onClick={() => void handleGenerate()}
              disabled={saving}
              style={{ fontSize: "0.875rem", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : "Generate & publish"}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ fontSize: "0.875rem" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tee times list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
          <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>No upcoming tee times</p>
          <p style={{ fontSize: "0.875rem" }}>Use the form above to add slots and start taking bookings.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, slots]) => (
          <div key={date} style={{ marginBottom: "1.75rem" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem" }}>
              {date}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {slots.map((slot) => {
                const time = new Date(slot.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                return (
                  <div
                    key={slot.id}
                    className="card"
                    style={{ padding: "0.75rem 1.125rem", display: "flex", alignItems: "center", gap: "1rem" }}
                  >
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", minWidth: 72 }}>{time}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", flex: 1 }}>
                      {slot.holes}h · {slot.available_spots} spot{slot.available_spots !== 1 ? "s" : ""} ·{" "}
                      {slot.cart_included ? "cart incl." : "walking"}
                    </p>
                    <p style={{ fontWeight: 700, color: "var(--brand)", minWidth: 48 }}>
                      ${Math.round(slot.price_cents / 100)}
                    </p>
                    <button
                      onClick={() => void handleDelete(slot.id)}
                      disabled={deletingId === slot.id}
                      style={{
                        padding: "0.3rem 0.6rem", borderRadius: 6, border: "1px solid var(--border)",
                        background: "transparent", color: "var(--muted)", fontSize: "0.75rem",
                        cursor: "pointer", opacity: deletingId === slot.id ? 0.5 : 1,
                      }}
                    >
                      {deletingId === slot.id ? "…" : "Delete"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
