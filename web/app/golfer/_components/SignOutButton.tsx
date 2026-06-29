"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    await createClient().auth.signOut();
    router.push("/golfer/login");
    router.refresh();
  };

  return (
    <button
      onClick={() => void signOut()}
      disabled={loading}
      style={{ padding: "0.45rem 0.9rem", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
