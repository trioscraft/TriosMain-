"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  hourly_rate: number | null;
  created_at: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit form
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }
      setUserEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("id, name, email, role, hourly_rate, created_at")
        .eq("email", user.email || "")
        .single();

      if (data) {
        setProfile(data as Profile);
        setName(data.name || "");
        setHourlyRate(String(data.hourly_rate || ""));
      }
      setLoading(false);
    })();
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);

    const { data: userResponse } = await supabase.auth.getUser();
    const userId = userResponse?.user?.id ?? "";
    let userName = name.trim() || userEmail;

    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        hourly_rate: hourlyRate === "" ? null : Number(hourlyRate) || 0,
      })
      .eq("id", profile.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setProfile((cur) =>
      cur
        ? {
            ...cur,
            name: name.trim(),
            hourly_rate: hourlyRate === "" ? null : Number(hourlyRate) || 0,
          }
        : cur
    );

    await logActivity({
      userId,
      userName,
      action: "updated their profile",
    });

    setSaving(false);
    setEditing(false);
  }

  const initial = (profile?.name || userEmail || "M").charAt(0).toUpperCase();

  const infoItems = [
    { label: "Name", value: profile?.name || "—" },
    { label: "Email", value: profile?.email || userEmail || "—" },
    { label: "Role", value: profile?.role || "Member" },
    { label: "Member since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
  ];

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div style={{ maxWidth: 760, margin: "0 auto", animation: "fadeUp 0.5s ease both" }}>
        {/* Header */}
        <div style={{ marginBottom: 26 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Account</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Profile
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
            Your details, role, and billing rate.
          </p>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 220 }} />
        ) : (
          <>
            {/* Profile card */}
            <div className="card" style={{ padding: "28px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div
                  className="avatar"
                  style={{
                    width: 72,
                    height: 72,
                    fontSize: 30,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {profile?.name || userEmail}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 3 }}>
                    {profile?.role || "Member"} · TriosFlow Workspace
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setEditing((v) => !v)}>
                  {editing ? "Cancel" : "Edit profile"}
                </button>
              </div>
            </div>

            {editing ? (
              /* Edit form */
              <div className="card" style={{ padding: "26px", marginBottom: 20, animation: "scaleIn 0.25s ease both" }}>
                <div className="m-section" style={{ marginBottom: 20 }}>Edit your details</div>
                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label className="label">Full name</label>
                    <input
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="label">Hourly rate (₹)</label>
                    <input
                      className="input"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g. 500"
                    />
                    <div className="field-error" style={{ marginTop: 6, color: "var(--text-tertiary)", fontSize: 12 }}>
                      Used to estimate your earnings from logged time.
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button className="btn" onClick={() => setEditing(false)} style={{ flex: 1 }}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                      style={{ flex: 2, opacity: saving ? 0.6 : 1 }}
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Info grid */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 14,
                }}
              >
                {infoItems.map((item, i) => (
                  <div
                    key={item.label}
                    className="stat-card"
                    style={{ animation: `fadeUp 0.45s ease both`, animationDelay: `${i * 55}ms` }}
                  >
                    <div className="m-metric-label">{item.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}