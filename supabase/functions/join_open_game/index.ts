// Supabase Edge Function placeholder. Production implementation should validate the
// authenticated user, lock membership capacity server-side, and insert either an
// accepted or waitlisted open_game_members row.

Deno.serve(() => {
  return new Response(JSON.stringify({ status: "not_configured" }), {
    headers: { "content-type": "application/json" },
    status: 501,
  });
});
