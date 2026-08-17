"use client";

import { useEffect, useState } from "react";

export type ClientData = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: string;
  created_at?: string;
};

export type ClientFormValues = Omit<ClientData, "id" | "created_at"> & {
  login_email?: string;
  login_password?: string;
};

type ClientFormProps = {
  initialData?: ClientFormValues;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
};

function makePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;
  let out = "";
  out += upper[Math.floor(Math.random() * upper.length)];
  out += lower[Math.floor(Math.random() * lower.length)];
  out += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 0; i < 9; i++) out += all[Math.floor(Math.random() * all.length)];
  return out;
}

function SectionCard({
  title,
  hint,
  accent,
  children,
}: {
  title: string;
  hint?: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: accent ? "1px solid var(--accent)" : "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        background: accent ? "rgba(216,167,92,0.06)" : "var(--bg-card)",
        display: "grid",
        gap: "16px",
        boxShadow: accent ? "0 0 0 3px rgba(216,167,92,0.10)" : "none",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: accent ? "var(--accent)" : "var(--text-primary)",
          }}
        >
          {title}
        </div>
        {hint ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "12.5px", marginTop: "4px" }}>
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Save Client",
}: ClientFormProps) {
  const isCreate = !initialData;

  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [contactName, setContactName] = useState(initialData?.contact_name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [status, setStatus] = useState(initialData?.status || "active");

  const [loginEmail, setLoginEmail] = useState(initialData?.login_email || "");
  const [loginPassword, setLoginPassword] = useState(initialData?.login_password || "");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setCompanyName(initialData?.company_name || "");
      setContactName(initialData?.contact_name || "");
      setEmail(initialData?.email || "");
      setPhone(initialData?.phone || "");
      setAddress(initialData?.address || "");
      setNotes(initialData?.notes || "");
      setStatus(initialData?.status || "active");
      setLoginEmail(initialData?.login_email || "");
      setLoginPassword(initialData?.login_password || "");
    }, 0);
    return () => window.clearTimeout(t);
  }, [initialData]);

  function submit() {
    const values: ClientFormValues = {
      company_name: companyName.trim(),
      contact_name: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      status,
    };
    if (isCreate) {
      values.login_email = loginEmail.trim();
      values.login_password = loginPassword;
    }
    void onSubmit(values);
  }

  function copyCreds() {
    const text = `Email: ${loginEmail.trim()}\nPassword: ${loginPassword}`;
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  }

  const twoCol: React.CSSProperties = {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "1fr 1fr",
  };

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <SectionCard title="Company Details" hint="Basic information about the client business.">
        <div>
          <label className="label">Company Name *</label>
          <input
            className="input"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            autoFocus
          />
        </div>

        <div style={twoCol}>
          <div>
            <label className="label">Contact Name</label>
            <input
              className="input"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Company Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div style={twoCol}>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <textarea
            className="input"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ minHeight: "70px" }}
          />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ minHeight: "80px" }}
          />
        </div>
      </SectionCard>

      {isCreate ? (
        <SectionCard
          title="Client Portal Login"
          hint="These are the credentials the client uses to sign in and track their project."
          accent
        >
          <div>
            <label className="label">Login Email *</label>
            <input
              className="input"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="client@company.com"
            />
          </div>

          <div>
            <label className="label">Login Password *</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{ paddingRight: "180px" }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={linkBtn}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                <button type="button" onClick={() => setLoginPassword(makePassword())} style={linkBtn}>
                  Generate
                </button>
                <button type="button" onClick={copyCreds} style={linkBtn}>
                  Copy
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        {onCancel ? (
          <button type="button" className="btn" onClick={onCancel} disabled={submitting} style={{ flex: 1 }}>
            Cancel
          </button>
        ) : null}

        <button
          type="button"
          className="btn btn-primary"
          onClick={submit}
          disabled={
            submitting ||
            !companyName.trim() ||
            (isCreate && (!loginEmail.trim() || !loginPassword))
          }
          style={{
            flex: 1,
            opacity:
              !companyName.trim() || (isCreate && (!loginEmail.trim() || !loginPassword))
                ? 0.5
                : 1,
          }}
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--accent)",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
  padding: 0,
};