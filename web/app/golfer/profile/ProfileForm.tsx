"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export type ProfileFormData = {
  profileId: string;
  displayName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  skillLevel: string;
  preferredGameStyle: string;
  city: string;
  state: string;
  zipCode: string;
  avatarUrl: string | null;
  privacy: {
    hideHandicap: boolean;
    hideApproximateLocation: boolean;
    hideRoundHistory: boolean;
    hideProfileDiscovery: boolean;
    hideLeaderboards: boolean;
  };
};

const SKILL_LEVELS = ["new", "casual", "recreational", "competitive", "elite"];
const GAME_STYLES = ["casual", "competitive", "both"];

const PRIVACY_FIELDS: { key: keyof ProfileFormData["privacy"]; label: string; hint: string }[] = [
  { key: "hideHandicap", label: "Hide my handicap", hint: "Keeps your estimate off your public profile." },
  { key: "hideApproximateLocation", label: "Hide my location", hint: "Hides your city and state from other players." },
  { key: "hideRoundHistory", label: "Hide my round history", hint: "Hides rounds played and recent form." },
  { key: "hideLeaderboards", label: "Hide me from leaderboards", hint: "Removes you from public rankings." },
  { key: "hideProfileDiscovery", label: "Hide my profile from discovery", hint: "Makes your public profile private entirely." },
];

const labelStyle = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)" } as const;
const inputStyle = {
  padding: "0.65rem 0.875rem", borderRadius: 10, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontSize: "0.9rem", outline: "none", width: "100%",
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>{title}</h2>
      {children}
    </section>
  );
}

function Status({ msg }: { msg: { kind: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: "0.82rem", fontWeight: 500, color: msg.kind === "ok" ? "var(--brand-bright)" : "#f0796b" }}>
      {msg.text}
    </p>
  );
}

export default function ProfileForm({ initial, authUserId }: { initial: ProfileFormData; authUserId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(initial);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [emailMsg, setEmailMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const set = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ── Avatar upload ──
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    setProfileMsg(null);
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${authUserId}/avatar_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      setProfileMsg({ kind: "err", text: `Avatar upload failed: ${upErr.message}` });
      setAvatarBusy(false);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", form.profileId);
    if (dbErr) {
      setProfileMsg({ kind: "err", text: `Couldn't save avatar: ${dbErr.message}` });
    } else {
      setAvatarUrl(url);
      setProfileMsg({ kind: "ok", text: "Photo updated." });
      router.refresh();
    }
    setAvatarBusy(false);
  };

  // ── Save profile + privacy ──
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const username = form.username.trim().toLowerCase();
    if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
      setProfileMsg({ kind: "err", text: "Username must be 3–20 chars: letters, numbers, _ or ." });
      setSavingProfile(false);
      return;
    }

    const { error: pErr } = await supabase
      .from("profiles")
      .update({
        display_name: form.displayName.trim(),
        username,
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
        skill_level: form.skillLevel,
        preferred_game_style: form.preferredGameStyle,
        city: form.city.trim(),
        state: form.state.trim(),
        zip_code: form.zipCode.trim(),
      })
      .eq("id", form.profileId);

    if (pErr) {
      const taken = pErr.code === "23505" || /duplicate|unique/i.test(pErr.message);
      setProfileMsg({ kind: "err", text: taken ? "That username is already taken." : pErr.message });
      setSavingProfile(false);
      return;
    }

    const { error: prErr } = await supabase.from("user_privacy_settings").upsert(
      {
        profile_id: form.profileId,
        hide_handicap: form.privacy.hideHandicap,
        hide_approximate_location: form.privacy.hideApproximateLocation,
        hide_round_history: form.privacy.hideRoundHistory,
        hide_profile_discovery: form.privacy.hideProfileDiscovery,
        hide_leaderboards: form.privacy.hideLeaderboards,
      },
      { onConflict: "profile_id" },
    );

    if (prErr) {
      setProfileMsg({ kind: "err", text: `Profile saved, but privacy failed: ${prErr.message}` });
    } else {
      setProfileMsg({ kind: "ok", text: "Profile saved." });
      router.refresh();
    }
    setSavingProfile(false);
  };

  // ── Account: email + password (Supabase auth) ──
  const updateEmail = async () => {
    setEmailMsg(null);
    const email = form.email.trim();
    if (!email || email === initial.email) {
      setEmailMsg({ kind: "err", text: "Enter a new email address." });
      return;
    }
    const { error } = await supabase.auth.updateUser({ email });
    setEmailMsg(
      error
        ? { kind: "err", text: error.message }
        : { kind: "ok", text: "Check your inbox to confirm the new email." },
    );
  };

  const updatePassword = async () => {
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg({ kind: "err", text: "Password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ kind: "err", text: "Passwords don't match." });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwMsg({ kind: "err", text: error.message });
    } else {
      setPwMsg({ kind: "ok", text: "Password updated." });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <form onSubmit={(e) => void saveProfile(e)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Avatar + public profile */}
      <SectionCard title="Public profile">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" style={{ width: 64, height: 64, borderRadius: 999, objectFit: "cover", border: "1px solid var(--border-strong)" }} />
          ) : (
            <span
              style={{ width: 64, height: 64, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "#fff", background: "var(--grad-brand)" }}
            >
              {(form.displayName.trim()[0] ?? "?").toUpperCase()}
            </span>
          )}
          <div>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              disabled={avatarBusy}
              onClick={() => fileRef.current?.click()}
            >
              {avatarBusy ? "Uploading…" : "Change photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void onAvatarChange(e)} />
          </div>
        </div>

        <Field label="Display name">
          <input style={inputStyle} value={form.displayName} onChange={(e) => set("displayName", e.target.value)} required />
        </Field>
        <Field label="Username">
          <input style={inputStyle} value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="username" required />
        </Field>
        <Field label="Bio">
          <textarea
            style={{ ...inputStyle, minHeight: 88, resize: "vertical", fontFamily: "inherit" }}
            value={form.bio}
            maxLength={280}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="A line or two about your game…"
          />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Field label="Skill level">
            <select style={inputStyle} value={form.skillLevel} onChange={(e) => set("skillLevel", e.target.value)}>
              {SKILL_LEVELS.map((s) => (
                <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
          <Field label="Preferred game style">
            <select style={inputStyle} value={form.preferredGameStyle} onChange={(e) => set("preferredGameStyle", e.target.value)}>
              {GAME_STYLES.map((s) => (
                <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
          <Field label="City"><input style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="State"><input style={inputStyle} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
          <Field label="ZIP"><input style={inputStyle} value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} /></Field>
        </div>
      </SectionCard>

      {/* Privacy */}
      <SectionCard title="Privacy">
        {PRIVACY_FIELDS.map((p) => (
          <label key={p.key} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.privacy[p.key]}
              onChange={(e) => setForm((f) => ({ ...f, privacy: { ...f.privacy, [p.key]: e.target.checked } }))}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--brand-bright)" }}
            />
            <span>
              <span style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>{p.label}</span>
              <span style={{ display: "block", fontSize: "0.78rem", color: "var(--muted)" }}>{p.hint}</span>
            </span>
          </label>
        ))}
      </SectionCard>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button type="submit" className="btn btn-gold" disabled={savingProfile} style={{ padding: "0.65rem 1.5rem" }}>
          {savingProfile ? "Saving…" : "Save changes"}
        </button>
        <Status msg={profileMsg} />
      </div>

      {/* Account */}
      <SectionCard title="Account">
        <Field label="Phone">
          <input style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 555-5555" />
          <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Saved with your profile. Never shown publicly.</span>
        </Field>

        <Field label="Email">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <button type="button" className="btn btn-ghost" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }} onClick={() => void updateEmail()}>
              Update
            </button>
          </div>
          <Status msg={emailMsg} />
        </Field>

        <Field label="New password">
          <input style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            <button type="button" className="btn btn-ghost" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }} onClick={() => void updatePassword()}>
              Update
            </button>
          </div>
          <Status msg={pwMsg} />
        </Field>
      </SectionCard>
    </form>
  );
}
