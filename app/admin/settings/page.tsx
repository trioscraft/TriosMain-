"use client";

import { useCallback, useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { PageHeader } from "@/components/admin/ui/Card";
import { Input, Textarea, Select, Field } from "@/components/admin/ui/Field";
import Button from "@/components/admin/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  Building2,
  Bell,
  ShieldCheck,
  ServerCog,
  Check,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import {
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  MAINTENANCE_SCOPE_OPTIONS,
  MAINTENANCE_TYPE_OPTIONS,
  type AppSettings,
  type SettingsInput,
} from "@/types/admin/settings";

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "system", label: "System", icon: ServerCog },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  company_name: "Trios Craft",
  business_email: "",
  phone: "",
  address: "",
  currency: "INR",
  timezone: "Asia/Kolkata",
  date_format: "DD MMM YYYY",
  sender_name: "Trios Craft",
  sender_email: "",
  notify_new_client: true,
  notify_project_updates: true,
  notify_invoice_paid: true,
  notify_reviews: true,
  notify_mentions: true,
  maintenance_mode: false,
  maintenance_scope: "both",
  maintenance_type: "scheduled",
  maintenance_message: "",
  maintenance_ends_at: null,
  updated_at: null,
  updated_by: null,
};

type Status = { type: "success" | "error"; message: string } | null;

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        padding: 2,
        border: "1px solid var(--border)",
        background: checked ? "var(--accent)" : "var(--glass-bg)",
        transition: "background .2s ease",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform .2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,.25)",
        }}
      />
    </button>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          color: "var(--text-tertiary)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
        }}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="settings-row">
      <div style={{ minWidth: 0, paddingRight: 16 }}>
        <div className="label">{label}</div>
        {description && (
          <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 3, maxWidth: 360 }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState<Status>(null);

  // maintenance timer UI
  const [durationMin, setDurationMin] = useState(5);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      const json = await res.json();
      if (json?.settings) setSettings(json.settings as AppSettings);
      if (json?.missingTable) {
        setStatus({
          type: "error",
          message:
            "Settings table not found in the database. Apply the 018_settings_table.sql migration, then refresh.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Could not load settings. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    })();
  }, [load]);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  // Tick every second to drive the live countdown.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const isMaintenanceActive = Boolean(
    settings.maintenance_mode &&
      (!settings.maintenance_ends_at ||
        new Date(settings.maintenance_ends_at).getTime() > now),
  );

  const remainingMs = isMaintenanceActive && settings.maintenance_ends_at
    ? Math.max(0, new Date(settings.maintenance_ends_at).getTime() - now)
    : 0;

  function formatRemaining(ms: number) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  async function applyMaintenance(patch: Partial<AppSettings>) {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...patch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to update maintenance.");
      if (json?.settings) setSettings(json.settings as AppSettings);
      setStatus({ type: "success", message: "Maintenance updated." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update maintenance.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to save settings.");
      if (json?.settings) setSettings(json.settings as AppSettings);
      setStatus({ type: "success", message: "Settings saved successfully." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);

    if (newPassword.length < 6) {
      setPwStatus({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    setPwLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No signed-in user found.");

      // Verify the current password before changing it.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInErr) throw new Error("Current password is incorrect.");

      const { error: updErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updErr) throw new Error(updErr.message);

      setPwStatus({ type: "success", message: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Could not update password.",
      });
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "860px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Settings"
          subtitle="Configure your workspace, notifications, security and system behavior."
          icon={<Settings size={22} />}
        />

        {status && (
          <div className={`toast toast-${status.type}`}>
            {status.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="settings-nav">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`settings-tab${active ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} style={{ marginRight: 8, verticalAlign: "-2px" }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="card" style={{ padding: 40, display: "flex", justifyContent: "center", color: "var(--text-tertiary)" }}>
            <Loader2 size={22} className="spin" />
          </div>
        ) : (
          <div className="card" style={{ padding: 24 }}>
            {activeTab === "general" && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Field label="Company name" htmlFor="company_name">
                  <Input
                    id="company_name"
                    value={settings.company_name}
                    onChange={(e) => update("company_name", e.target.value)}
                    placeholder="Trios Craft"
                  />
                </Field>

                <Row label="Business email" description="Used on invoices, quotes and client communications.">
                  <Input
                    type="email"
                    style={{ width: 280 }}
                    value={settings.business_email}
                    onChange={(e) => update("business_email", e.target.value)}
                    placeholder="hello@trioscraft.com"
                  />
                </Row>

                <Row label="Phone">
                  <Input
                    style={{ width: 280 }}
                    value={settings.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+91 90000 00000"
                  />
                </Row>

                <Field label="Address" htmlFor="address">
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="Studio address"
                  />
                </Field>

                <Row label="Currency" description="Default currency for invoices and quotes.">
                  <Select
                    style={{ width: 200 }}
                    value={settings.currency}
                    onChange={(e) => update("currency", e.target.value)}
                  >
                    {CURRENCY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Row>

                <Row label="Timezone" description="Used when scheduling and displaying dates.">
                  <Select
                    style={{ width: 260 }}
                    value={settings.timezone}
                    onChange={(e) => update("timezone", e.target.value)}
                  >
                    {TIMEZONE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Row>

                <Row label="Date format" description="How dates appear across the app.">
                  <Select
                    style={{ width: 200 }}
                    value={settings.date_format}
                    onChange={(e) => update("date_format", e.target.value)}
                  >
                    {DATE_FORMAT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Row>
              </div>
            )}

            {activeTab === "notifications" && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Field label="Sender name" htmlFor="sender_name">
                  <Input
                    id="sender_name"
                    value={settings.sender_name}
                    onChange={(e) => update("sender_name", e.target.value)}
                    placeholder="Trios Craft"
                  />
                </Field>

                <Row label="Sender email" description="The 'from' address for automated emails.">
                  <Input
                    type="email"
                    style={{ width: 300 }}
                    value={settings.sender_email}
                    onChange={(e) => update("sender_email", e.target.value)}
                    placeholder="notifications@trioscraft.com"
                  />
                </Row>

                <div style={{ marginTop: 8 }}>
                  <div className="section-label" style={{ marginBottom: 4 }}>
                    Email notifications
                  </div>
                  <Row label="New client signups" description="When a new client account is created.">
                    <Toggle
                      checked={settings.notify_new_client}
                      onChange={(v) => update("notify_new_client", v)}
                    />
                  </Row>
                  <Row label="Project updates" description="Status changes and milestone activity.">
                    <Toggle
                      checked={settings.notify_project_updates}
                      onChange={(v) => update("notify_project_updates", v)}
                    />
                  </Row>
                  <Row label="Invoice paid" description="When a client marks an invoice as paid.">
                    <Toggle
                      checked={settings.notify_invoice_paid}
                      onChange={(v) => update("notify_invoice_paid", v)}
                    />
                  </Row>
                  <Row label="New reviews" description="When a client leaves a portfolio review.">
                    <Toggle
                      checked={settings.notify_reviews}
                      onChange={(v) => update("notify_reviews", v)}
                    />
                  </Row>
                  <Row label="@mentions" description="When you are mentioned in team chat.">
                    <Toggle
                      checked={settings.notify_mentions}
                      onChange={(v) => update("notify_mentions", v)}
                    />
                  </Row>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "var(--accent-soft)",
                      border: "1px solid var(--border-accent)",
                      color: "var(--accent)",
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      Signed in as
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {userEmail || "Loading…"}
                    </div>
                  </div>
                </div>

                <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Current password" htmlFor="current">
                    <PasswordInput
                      id="current"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      placeholder="Enter current password"
                    />
                  </Field>
                  <Field label="New password" htmlFor="newp">
                    <PasswordInput
                      id="newp"
                      value={newPassword}
                      onChange={setNewPassword}
                      placeholder="At least 6 characters"
                    />
                  </Field>
                  <Field label="Confirm new password" htmlFor="conf">
                    <PasswordInput
                      id="conf"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Re-enter new password"
                    />
                  </Field>

                  {pwStatus && (
                    <div className={`toast toast-${pwStatus.type}`}>
                      {pwStatus.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
                      <span>{pwStatus.message}</span>
                    </div>
                  )}

                  <div>
                    <Button type="submit" variant="primary" loading={pwLoading} leftIcon={<Lock size={15} />}>
                      Update password
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "system" && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Row
                  label="Maintenance mode"
                  description="Take a portal offline. Choose which panel is affected — keep the other one running if only one has issues."
                >
                  <Toggle
                    checked={settings.maintenance_mode}
                    disabled={saving}
                    onChange={(v) =>
                      applyMaintenance({ maintenance_mode: v, maintenance_ends_at: null })
                    }
                  />
                </Row>

                <Row
                  label="Affected panel"
                  description="Which portal should show the maintenance page?"
                >
                  <div
                    style={{
                      display: "inline-flex",
                      background: "var(--glass-bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: 3,
                    }}
                  >
                    {MAINTENANCE_SCOPE_OPTIONS.map((opt) => {
                      const active = settings.maintenance_scope === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("maintenance_scope", opt.value)}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "var(--radius-sm)",
                            border: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            background: active ? "var(--accent)" : "transparent",
                            color: active ? "#fff" : "var(--text-secondary)",
                            transition: "all .15s ease",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </Row>

                <Row label="Maintenance type" description="Shown as a badge on the maintenance page.">
                  <Select
                    style={{ width: 220 }}
                    value={settings.maintenance_type}
                    onChange={(e) =>
                      update("maintenance_type", e.target.value as AppSettings["maintenance_type"])
                    }
                  >
                    {MAINTENANCE_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Row>

                <Field label="Custom message (optional)" htmlFor="maint-msg">
                  <Textarea
                    id="maint-msg"
                    value={settings.maintenance_message}
                    onChange={(e) => update("maintenance_message", e.target.value)}
                    placeholder="We're upgrading the client portal and will be back shortly."
                  />
                </Field>

                {isMaintenanceActive ? (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "18px 20px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--amber-dim)",
                      border: "1px solid rgba(201,134,43,0.3)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--amber)",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <AlertTriangle size={16} /> Maintenance is live
                      {settings.maintenance_scope === "client"
                        ? " — Client portal"
                        : settings.maintenance_scope === "member"
                        ? " — Member workspace"
                        : " — Both portals"}
                    </div>
                    {settings.maintenance_ends_at ? (
                      <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 10 }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                          Live again in
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 26,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {formatRemaining(remainingMs)}
                        </span>
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--text-secondary)" }}>
                        No scheduled end time — turn off manually below.
                      </div>
                    )}
                    <div style={{ marginTop: 14 }}>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={saving}
                        onClick={() =>
                          applyMaintenance({ maintenance_mode: false, maintenance_ends_at: null })
                        }
                      >
                        Stop now
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "16px 18px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--glass-bg)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                      <div className="label" style={{ marginBottom: 6 }}>
                        Timed maintenance
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Input
                          type="number"
                          min={1}
                          max={1440}
                          value={durationMin}
                          onChange={(e) => setDurationMin(Math.max(1, Number(e.target.value) || 1))}
                          style={{ width: 90 }}
                        />
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>minutes</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      loading={saving}
                      leftIcon={<ServerCog size={15} />}
                      onClick={() =>
                        applyMaintenance({
                          maintenance_mode: true,
                          maintenance_ends_at: new Date(
                            Date.now() + durationMin * 60000,
                          ).toISOString(),
                        })
                      }
                    >
                      Start maintenance
                    </Button>
                  </div>
                )}

                {settings.maintenance_mode && !isMaintenanceActive && (
                  <div className="toast toast-error" style={{ marginTop: 8 }}>
                    <AlertTriangle size={16} />
                    <span>Timed maintenance has ended. Turn it off to clear the status.</span>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 18,
                    fontSize: 12.5,
                    color: "var(--text-tertiary)",
                    lineHeight: 1.6,
                  }}
                >
                  Changes apply within a few seconds. Admins can always reach this page to stop
                  maintenance.
                  <br />
                  Last updated:{" "}
                  {settings.updated_at
                    ? new Date(settings.updated_at).toLocaleString()
                    : "never"}
                </div>
              </div>
            )}

            {activeTab !== "security" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 22,
                  paddingTop: 18,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <Button
                  variant="primary"
                  loading={saving}
                  onClick={saveAll}
                  leftIcon={!saving ? <Check size={15} /> : undefined}
                >
                  Save changes
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
