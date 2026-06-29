"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export type Application = {
  id: string;
  contact_name: string;
  email: string;
  course_name: string;
  facility_name: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
  created_at: string;
};

const STATUS_STYLE: Record<Application["status"], React.CSSProperties> = {
  pending: { background: "rgba(210,155,34,0.12)", color: "var(--gold, #b8860b)" },
  approved: { background: "rgba(26,122,69,0.12)", color: "var(--brand)" },
  rejected: { background: "rgba(220,38,38,0.1)", color: "#dc2626" },
};

export default function ReviewClient({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function approve(id: string) {
    setError("");
    setBusyId(id);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("approve_course_application", { p_application_id: id });
    setBusyId(null);
    if (rpcError) { setError(rpcError.message); return; }
    router.refresh();
  }

  async function reject(id: string) {
    const notes = window.prompt("Reason for rejection (optional — shown to the applicant):") ?? null;
    setError("");
    setBusyId(id);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("reject_course_application", {
      p_application_id: id,
      p_notes: notes,
    });
    setBusyId(null);
    if (rpcError) { setError(rpcError.message); return; }
    router.refresh();
  }

  if (applications.length === 0) {
    return (
      <div className="card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--muted)" }}>
        No course applications yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {error && (
        <p style={{ fontSize: "0.85rem", color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "0.6rem 0.9rem" }}>
          {error}
        </p>
      )}
      {applications.map((app) => (
        <div key={app.id} className="card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>{app.course_name}</h3>
                <span style={{ ...STATUS_STYLE[app.status], fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0.15rem 0.5rem", borderRadius: 999 }}>
                  {app.status}
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {app.city}, {app.state} {app.zip_code}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-2)", marginTop: "0.5rem" }}>
                {app.contact_name} · {app.email}{app.phone ? ` · ${app.phone}` : ""}
              </p>
              {app.review_notes && (
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem", fontStyle: "italic" }}>
                  Note: {app.review_notes}
                </p>
              )}
            </div>

            {app.status === "pending" && (
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button
                  onClick={() => void approve(app.id)}
                  disabled={busyId === app.id}
                  className="btn btn-primary"
                  style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem", opacity: busyId === app.id ? 0.6 : 1 }}
                >
                  {busyId === app.id ? "…" : "Approve"}
                </button>
                <button
                  onClick={() => void reject(app.id)}
                  disabled={busyId === app.id}
                  style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontWeight: 600 }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
