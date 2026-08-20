"use client";

import { useEffect, useState } from "react";
import { ServerCog, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import "@/app/admin/admin.css";
import "@/app/client/client.css";
import "@/app/admin/member.css";
import type { AppSettings } from "@/types/admin/settings";

type Panel = "client" | "member";

const PANEL_META: Record<Panel, { wrapper: string; home: string; title: string; noun: string }> = {
  client: {
    wrapper: "admin-shell client-portal",
    home: "/client",
    title: "Client Portal",
    noun: "client portal",
  },
  member: {
    wrapper: "admin-shell member-shell",
    home: "/member",
    title: "Member Workspace",
    noun: "member workspace",
  },
};

const TYPE_LABEL: Record<string, string> = {
  scheduled: "Scheduled Maintenance",
  emergency: "Emergency Maintenance",
  updating: "We're Updating",
};

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
  maintenance_reopen_at: null,
  maintenance_started_at: null,
  updated_at: null,
  updated_by: null,
};

function formatRemaining(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function MaintenancePage() {
  const [panel, setPanel] = useState<Panel>("client");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [now, setNow] = useState(() => Date.now());
  const [loaded, setLoaded] = useState(false);

  // Read the panel from the query string (?panel=client|member).
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("panel");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (p === "client" || p === "member") setPanel(p);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (active && json?.settings) setSettings(json.settings as AppSettings);
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const meta = PANEL_META[panel];
  const scope = settings.maintenance_scope || "both";
  const scopeMatches = scope === panel || scope === "both";

  const endsAt = settings.maintenance_ends_at
    ? new Date(settings.maintenance_ends_at).getTime()
    : null;
  const reopenAt = settings.maintenance_reopen_at
    ? new Date(settings.maintenance_reopen_at).getTime()
    : null;

  const activeNow =
    Boolean(settings.maintenance_mode) && scopeMatches && (!endsAt || endsAt > now);
  const cooldownNow = !settings.maintenance_mode && scopeMatches && reopenAt != null && reopenAt > now;
  const underMaintenance = activeNow || cooldownNow;

  const reopenRemaining = cooldownNow && reopenAt ? Math.max(0, reopenAt - now) : 0;
  const remaining = activeNow && endsAt ? Math.max(0, endsAt - now) : reopenRemaining;
  const expired = endsAt != null && endsAt <= now;

  // When the timer ends, redirect back into the portal.
  useEffect(() => {
    if (
      scopeMatches &&
      ((settings.maintenance_mode && endsAt && endsAt <= now) ||
        (reopenAt != null && reopenAt <= now))
    ) {
      const t = setTimeout(() => {
        window.location.href = meta.home;
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [settings.maintenance_mode, endsAt, reopenAt, now, scopeMatches, meta.home]);

  const typeLabel = TYPE_LABEL[settings.maintenance_type] || "Maintenance";
  const customMessage = settings.maintenance_message?.trim();
  const defaultMessage = `We're performing ${typeLabel.toLowerCase()} on the ${meta.noun} right now. Thank you for your patience — we'll be back shortly.`;
  const doneMessage = `Maintenance is complete. The ${meta.noun} will reopen automatically — see the timer below. Thanks for your patience.`;

  return (
    <main
      className={meta.wrapper}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          padding: "40px 32px",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--glass-shadow)",
          border: "1px solid var(--glass-border)",
          animation: "fadeUp 0.5s ease both",
        }}
      >
        {!loaded ? (
          <div style={{ color: "var(--text-tertiary)", padding: 20 }}>
            <Clock size={22} className="spin" style={{ display: "inline-block" }} />
          </div>
        ) : !underMaintenance ? (
          <>
            <div
              style={{
                width: 60,
                height: 60,
                margin: "0 auto 18px",
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                background: "var(--green-dim)",
                color: "var(--green)",
              }}
            >
              <CheckCircle2 size={30} />
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              {meta.title} is available
            </h1>
            <p style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 14 }}>
              {expired
                ? "Maintenance has ended — you're good to go."
                : "This portal isn't under maintenance right now."}
            </p>
            <a
              href={meta.home}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 22,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: "var(--accent)",
                padding: "11px 18px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
              }}
            >
              Enter {meta.title} <ArrowRight size={16} />
            </a>
          </>
        ) : cooldownNow ? (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 18px",
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                background: "var(--green-dim)",
                color: "var(--green)",
                boxShadow: "0 8px 22px -6px var(--green-glow)",
              }}
            >
              <CheckCircle2 size={30} />
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--green)",
                background: "var(--green-dim)",
                border: "1px solid rgba(78,125,94,0.28)",
                padding: "6px 12px",
                borderRadius: 999,
              }}
            >
              <CheckCircle2 size={13} /> Maintenance complete
            </span>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                margin: "16px 0 0",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              {meta.title} reopens shortly
            </h1>

            <p
              style={{
                marginTop: 12,
                color: "var(--text-secondary)",
                fontSize: 14.5,
                lineHeight: 1.6,
              }}
            >
              {doneMessage}
            </p>

            <div
              style={{
                marginTop: 26,
                padding: "18px",
                borderRadius: "var(--radius-lg)",
                background: "var(--glass-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Portal opens in
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 34,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatRemaining(remaining)}
              </div>
            </div>

            <div style={{ marginTop: 22, fontSize: 12.5, color: "var(--text-tertiary)" }}>
              {settings.company_name || settings.sender_name || "Trios Craft"} · Admins can access
              the control panel.
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 18px",
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, var(--accent-bright), var(--accent))",
                color: "#fff",
                boxShadow: "0 0 0 1px var(--border-accent), 0 8px 22px -6px var(--accent-glow)",
              }}
            >
              <ServerCog size={30} />
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--accent)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                padding: "6px 12px",
                borderRadius: 999,
              }}
            >
              <Clock size={13} /> {typeLabel}
            </span>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                margin: "16px 0 0",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              {meta.title} is under maintenance
            </h1>

            <p
              style={{
                marginTop: 12,
                color: "var(--text-secondary)",
                fontSize: 14.5,
                lineHeight: 1.6,
              }}
            >
              {customMessage || defaultMessage}
            </p>

            {endsAt ? (
              <div
                style={{
                  marginTop: 26,
                  padding: "18px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Live again in
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatRemaining(remaining)}
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: 24,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12.5,
                  color: "var(--text-tertiary)",
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "var(--glass-bg)",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--amber)",
                    boxShadow: "0 0 8px var(--amber-glow)",
                  }}
                />
                No scheduled end time
              </div>
            )}

            <div style={{ marginTop: 22, fontSize: 12.5, color: "var(--text-tertiary)" }}>
              {settings.company_name || settings.sender_name || "Trios Craft"} · Admins can access
              the control panel.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
