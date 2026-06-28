"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type CourseData = {
  id: string; name: string; facility_name: string;
  city: string; state: string; zip_code: string;
  latitude: number; longitude: number; amenities: string[];
} | null;

function Input({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.6rem 0.875rem", borderRadius: 10, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontSize: "0.875rem", outline: "none",
  width: "100%",
};

export default function SettingsClient({
  authUserId,
  courseId,
  course,
  stripeOnboarded,
}: {
  authUserId: string;
  courseId: string | null;
  course: CourseData;
  stripeOnboarded: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(course?.name ?? "");
  const [facilityName, setFacilityName] = useState(course?.facility_name ?? "");
  const [city, setCity] = useState(course?.city ?? "");
  const [state, setState] = useState(course?.state ?? "");
  const [zip, setZip] = useState(course?.zip_code ?? "");
  const [lat, setLat] = useState(course?.latitude?.toString() ?? "");
  const [lng, setLng] = useState(course?.longitude?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [connectingStripe, setConnectingStripe] = useState(false);

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    const res = await fetch("/api/stripe/create-connect-account", { method: "POST" });
    const json = await res.json() as { url?: string; error?: string };
    if (json.url) {
      window.location.href = json.url;
    } else {
      setError(json.error ?? "Failed to start Stripe onboarding.");
      setConnectingStripe(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const supabase = createClient();

    const payload = {
      name: name.trim(),
      facility_name: facilityName.trim() || name.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase().slice(0, 2),
      zip_code: zip.trim(),
      latitude: parseFloat(lat) || 0,
      longitude: parseFloat(lng) || 0,
      amenities: [],
      is_demo: false,
    };

    if (courseId) {
      // Update existing course
      const { error: err } = await supabase.from("courses").update(payload).eq("id", courseId);
      if (err) { setError(err.message); setSaving(false); return; }
      setMessage("Course details saved.");
    } else {
      // Create course + link operator
      const { data: newCourse, error: err } = await supabase
        .from("courses")
        .insert(payload)
        .select("id")
        .single();

      if (err || !newCourse) { setError(err?.message ?? "Failed to create course."); setSaving(false); return; }

      const { error: opErr } = await supabase
        .from("course_operators")
        .insert({ auth_user_id: authUserId, course_id: newCourse.id, role: "owner" });

      if (opErr) { setError(opErr.message); setSaving(false); return; }
      setMessage("Course registered successfully!");
      router.refresh();
    }

    setSaving(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 640 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>Settings</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.2rem" }}>
          {courseId ? "Update your course details." : "Register your course to start publishing tee times."}
        </p>
      </div>

      {/* Stripe Connect */}
      {courseId && (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>Stripe payouts</p>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
              {stripeOnboarded
                ? "Your Stripe account is connected. Golfers can now pay and you'll receive direct payouts."
                : "Connect Stripe to accept payments and receive direct payouts from bookings."}
            </p>
          </div>
          {stripeOnboarded ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.875rem", borderRadius: 99, background: "rgba(26,122,69,0.1)", color: "var(--brand)", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>
              ✓ Connected
            </span>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => void handleConnectStripe()}
              disabled={connectingStripe}
              style={{ fontSize: "0.8rem", whiteSpace: "nowrap", opacity: connectingStripe ? 0.7 : 1 }}
            >
              {connectingStripe ? "Redirecting…" : "Connect Stripe"}
            </button>
          )}
        </div>
      )}

      <form onSubmit={(e) => void handleSave(e)}>
        <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.125rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: "0.25rem" }}>
            Course information
          </h2>

          <Input label="Course name *">
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Oakwood Golf Club" style={inputStyle} />
          </Input>
          <Input label="Facility name">
            <input value={facilityName} onChange={(e) => setFacilityName(e.target.value)} placeholder="Same as course name if blank" style={inputStyle} />
          </Input>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: "0.75rem" }}>
            <Input label="City *">
              <input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Nashville" style={inputStyle} />
            </Input>
            <Input label="State *">
              <input value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} required placeholder="TN" maxLength={2} style={inputStyle} />
            </Input>
            <Input label="ZIP *">
              <input value={zip} onChange={(e) => setZip(e.target.value)} required placeholder="37201" maxLength={10} style={inputStyle} />
            </Input>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Input label="Latitude">
              <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="36.1627" style={inputStyle} />
            </Input>
            <Input label="Longitude">
              <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-86.7816" style={inputStyle} />
            </Input>
          </div>

          <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Tip: find lat/lng by right-clicking your course on Google Maps → "What's here?"
          </p>

          {error && <p style={{ fontSize: "0.8rem", color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "0.5rem 0.75rem" }}>{error}</p>}
          {message && <p style={{ fontSize: "0.8rem", color: "var(--brand)", background: "rgba(26,122,69,0.08)", borderRadius: 8, padding: "0.5rem 0.75rem" }}>{message}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ alignSelf: "flex-start", fontSize: "0.875rem", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : courseId ? "Save changes" : "Register course"}
          </button>
        </div>
      </form>
    </div>
  );
}
