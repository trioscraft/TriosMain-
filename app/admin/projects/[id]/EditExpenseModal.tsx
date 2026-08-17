"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Textarea } from "@/components/admin/ui/Field";
import Button from "@/components/admin/ui/Button";

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

export default function EditExpenseModal({ open, expense, projectName, onClose, onSuccess }: EditExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
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
      .update({ title: title.trim(), amount: numericAmount, notes: notes.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", expense.id);
    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }
    let userName = "Unknown";
    if (user?.email) {
      const { data: profile } = await supabase.from("profiles").select("name").eq("email", user.email).single();
      if (profile?.name) userName = profile.name;
    }
    await logActivity({ userId: user.id, userName, action: `updated expense: ${title.trim()} (₹${numericAmount.toLocaleString("en-IN")})`, projectId: expense.project_id, projectName });
    setSaving(false);
    onClose();
    onSuccess();
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Expense" footer={null}>
      <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: -8, marginBottom: 18 }}>Update expense details.</p>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Title" htmlFor="etitle" required>
            <Input id="etitle" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </Field>
          <Field label="Amount (₹)" htmlFor="eamount" required>
            <Input id="eamount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
        </div>
        <Field label="Notes (optional)" htmlFor="enotes">
          <Input id="enotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." />
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={!title.trim()} style={{ flex: 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
