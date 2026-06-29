// Join an open game with server-side capacity enforcement.
// Authenticates the caller, resolves their profile, and delegates the
// accept-vs-waitlist decision to the atomic `join_open_game` SQL function
// so concurrent joins can never overfill a game.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!jwt) return json({ error: "Unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) {
    return json({ error: "Server not configured" }, 500);
  }

  let openGameId: string | undefined;
  try {
    openGameId = (await req.json())?.openGameId;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!openGameId) return json({ error: "Missing openGameId" }, 400);

  // Verify the caller from their JWT.
  const authClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: { user }, error: authErr } = await authClient.auth.getUser();
  if (authErr || !user) return json({ error: "Invalid token" }, 401);

  const admin = createClient(url, serviceKey);

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (!profile) return json({ error: "Profile not found" }, 404);

  const { data, error } = await admin.rpc("join_open_game", {
    p_open_game_id: openGameId,
    p_profile_id: profile.id,
  });
  if (error) return json({ error: error.message }, 400);

  if (data === "not_found") return json({ error: "Game not found" }, 404);

  // 'joined' | 'waitlisted' | 'already_member'
  return json({ status: data });
});
