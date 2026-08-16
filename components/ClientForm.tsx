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

export type ClientFormValues = Omit<ClientData, "id" | "created_at">;

type ClientFormProps = {
  initialData?: ClientFormValues;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
};

export default function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Save Client",
}: ClientFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [contactName, setContactName] = useState(initialData?.contact_name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [status, setStatus] = useState(initialData?.status || "active");

  useEffect(() => {
    // Sync state after render to avoid cascading-render lint errors
    const t = window.setTimeout(() => {
      setCompanyName(initialData?.company_name || "");
      setContactName(initialData?.contact_name || "");
      setEmail(initialData?.email || "");
      setPhone(initialData?.phone || "");
      setAddress(initialData?.address || "");
      setNotes(initialData?.notes || "");
      setStatus(initialData?.status || "active");
    }, 0);

    return () => window.clearTimeout(t);
  }, [initialData]);


  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div>
        <label className="label">Company Name</label>
        <input
          className="input"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          autoFocus
        />
      </div>

      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="label">Contact Name</label>
          <input
            className="input"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
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
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ minHeight: "90px" }}
        />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ minHeight: "100px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
        {onCancel ? (
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        ) : null}

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            onSubmit({
              company_name: companyName.trim(),
              contact_name: contactName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              address: address.trim(),
              notes: notes.trim(),
              status,
            })
          }
          disabled={submitting || !companyName.trim()}
          style={{ flex: 1, opacity: !companyName.trim() ? 0.5 : 1 }}
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
