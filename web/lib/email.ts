// Transactional email via Resend's REST API (no SDK dependency — just fetch).
// Requires RESEND_API_KEY and a verified golftheclubhouse.com sending domain.

const FROM = "The Clubhouse <support@golftheclubhouse.com>";
const REPLY_TO = "support@golftheclubhouse.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golftheclubhouse.com";

type SendResult = { ok: boolean; skipped?: boolean };

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, reply_to: REPLY_TO, subject, html }),
    });
    if (!res.ok) {
      console.error("[email] Resend error", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false };
  }
}

function shell(body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.6">
    <div style="font-size:20px;font-weight:700;color:#1a7a45;margin-bottom:16px">⛳ The Clubhouse</div>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px" />
    <p style="font-size:12px;color:#888">The Clubhouse · Questions? Reply to this email or reach us at ${REPLY_TO}.</p>
  </div>`;
}

export type ApplicationDecision = {
  email: string;
  contact_name: string | null;
  course_name: string | null;
  status: "approved" | "rejected" | "pending";
  review_notes: string | null;
};

export async function sendApplicationDecisionEmail(app: ApplicationDecision): Promise<SendResult> {
  const name = app.contact_name?.split(" ")[0] || "there";
  const course = app.course_name || "your course";

  if (app.status === "approved") {
    return send(
      app.email,
      `${course} is approved on The Clubhouse 🎉`,
      shell(`
        <p>Hi ${name},</p>
        <p>Great news — <strong>${course}</strong> has been approved on The Clubhouse. Your operator portal is now unlocked.</p>
        <p>Sign in to set up your tee sheet, confirm your course details, and start taking zero-commission bookings:</p>
        <p style="margin:24px 0">
          <a href="${SITE_URL}/admin/login" style="background:#1a7a45;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">Open your portal</a>
        </p>
        <p style="font-size:13px;color:#666">Tip: head to <strong>Settings</strong> first to confirm your course's location and details.</p>
      `),
    );
  }

  if (app.status === "rejected") {
    const note = app.review_notes
      ? `<p style="background:#f7f7f7;border-radius:8px;padding:12px 14px;font-size:14px">${app.review_notes}</p>`
      : "";
    return send(
      app.email,
      `Update on your Clubhouse application`,
      shell(`
        <p>Hi ${name},</p>
        <p>Thanks for your interest in bringing <strong>${course}</strong> to The Clubhouse. We aren't able to approve your application at this time.</p>
        ${note}
        <p>If you think this was a mistake or your situation changes, just reply to this email and we'll take another look.</p>
      `),
    );
  }

  return { ok: false, skipped: true };
}
