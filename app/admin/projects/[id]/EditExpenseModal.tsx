"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export type ExpenseData = {
  id: string;
  project_id: string;
  title: string;
  amount: number;
  notes: string | null;
};

type EditExpenseModalProps = {
  open: boolean;
  expense: ExpenseData;
  projectName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditExpenseModal({
  open,
  expense,
  projectName,
  onClose,
  onSuccess,
}: EditExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Initialize local form state after render to avoid cascading-render lint errors
    const t = window.setTimeout(() => {
      setTitle(expense.title || "");
      setAmount(String(expense.amount ?? ""));
      setNotes(expense.notes || "");
    }, 0);

    return () => window.clearTimeout(t);
  }, [open, expense.id, expense.title, expense.amount, expense.notes]);


  async function handleSave() {
    if (!title.trim()) {
      alert("Expense title is required.");
      return;
    }

    setSaving(true);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      alert("You must be logged in to edit expenses.");
      setSaving(false);
      return;
    }

    const numericAmount = parseFloat(amount) || 0;

    const { error } = await supabase
      .from("expenses")
      .update({
        title: title.trim(),
        amount: numericAmount,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", expense.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    let userName = "Unknown";
    if (user?.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", user.email)
        .single();
      if (profile?.name) {
        userName = profile.name;
      }
    }

    await logActivity({
      userId: user.id,
      userName,
      action: `updated expense: ${title.trim()} (₹${numericAmount.toLocaleString("en-IN")})`,
      projectId: expense.project_id,
      projectName,
    });

    setSaving(false);
    onClose();
    onSuccess();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "var(--bg-surface)",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          padding: "28px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              Edit Expense
            </div>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
              Update expense details.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "24px",
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Title
              </label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Amount (₹)
              </label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "var(--text-tertiary)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Notes (optional)
            </label>
            <input
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              className="btn"
              onClick={onClose}
              style={{ flex: 1 }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              style={{ flex: 1, opacity: !title.trim() ? 0.5 : 1 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}