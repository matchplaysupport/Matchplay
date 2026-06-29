"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "./actions";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function cancel() {
    setError("");
    startTransition(async () => {
      const res = await cancelBooking(bookingId);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Couldn't cancel.");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
      <button
        onClick={cancel}
        disabled={pending}
        style={{ padding: "0.3rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: "0.74rem", cursor: "pointer", fontWeight: 600 }}
      >
        {pending ? "Cancelling…" : "Cancel"}
      </button>
      {error && <span style={{ fontSize: "0.66rem", color: "#dc2626" }}>{error}</span>}
    </div>
  );
}
