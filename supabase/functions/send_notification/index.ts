// Internal fan-out: persist an in-app notification and deliver it to a golfer's
// registered devices via the Expo push service. Called server-to-server (DB
// triggers, cron jobs, last-minute slot-alert flows) — guarded by a shared secret.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("INTERNAL_NOTIFY_SECRET");
  if (!secret || req.headers.get("x-internal-secret") !== secret) {
    return json({ error: "Forbidden" }, 403);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Server not configured" }, 500);

  let payload: {
    profileId?: string;
    type?: string;
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { profileId, type, title, body, data } = payload;
  if (!profileId || !title || !body) {
    return json({ error: "Missing profileId, title, or body" }, 400);
  }

  const admin = createClient(url, serviceKey);

  // 1) Persist the in-app notification.
  const { error: insertErr } = await admin.from("notifications").insert({
    profile_id: profileId,
    type: type ?? "system",
    title,
    body,
  });
  if (insertErr) return json({ error: insertErr.message }, 400);

  // 2) Fan out to the golfer's registered devices.
  const { data: tokens } = await admin
    .from("device_push_tokens")
    .select("token")
    .eq("profile_id", profileId);

  const messages = (tokens ?? []).map((t) => ({
    to: t.token as string,
    title,
    body,
    sound: "default",
    data: data ?? {},
  }));

  let pushed = 0;
  if (messages.length > 0) {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(messages),
    });
    if (res.ok) pushed = messages.length;
  }

  return json({ ok: true, pushed });
});
