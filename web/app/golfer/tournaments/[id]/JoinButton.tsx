"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinTournament } from "./actions";

export default function JoinButton({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function join() {
    setError("");
    startTransition(async () => {
      const res = await joinTournament(tournamentId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
      <button onClick={join} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.7 : 1 }}>
        {pending ? "Joining…" : "Join this event"}
      </button>
      {error && <p style={{ fontSize: "0.8rem", color: "#dc2626" }}>{error}</p>}
    </div>
  );
}
