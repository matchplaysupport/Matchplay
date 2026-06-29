"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();
  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/golfer/login");
    router.refresh();
  };
  return (
    <button
      onClick={() => void signOut()}
      style={{
        fontSize: "0.8rem", fontWeight: 600, color: "var(--muted)",
        background: "none", border: "none", cursor: "pointer", padding: 0,
      }}
    >
      Sign out
    </button>
  );
}
