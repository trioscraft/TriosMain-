"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/Field";
import Button from "@/components/admin/ui/Button";

const EXPENSE_CATEGORIES = [
  { value: "hosting", label: "Hosting" },
  { value: "domain", label: "Domain" },
  { value: "api_costs", label: "API Costs" },
  { value: "advertising", label: "Advertising" },
  { value: "freelancer", label: "Freelancer Payments" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export default function AddExpenseForm({ projectId, projectName, onSuccess }: { projectId: string; projectName: string; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("miscellaneous");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function addExpense() {
    if (!title.trim() || !amount) return;
    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      alert("You must be logged in to add expenses.");
      setLoading(false);
      return;
    }
    const expenseTitle = title.trim();
    const numericAmount = parseFloat(amount);
    const { error } = await supabase
      .from("expenses")
      .insert([{ project_id: projectId, title: expenseTitle, amount: numericAmount, category, notes: notes.trim() || null, created_by: user.id }]);
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    let userName = "Unknown";
    if (user?.email) {
      const { data: profile } = await supabase.from("profiles").select("name").eq("email", user.email).single();
      if (profile?.name) userName = profile.name;
    }
    await logActivity({ userId: user.id, userName, action: `added expense: ${expenseTitle} (₹${numericAmount.toLocaleString("en-IN")})`, projectId, projectName });
    setTitle("");
    setAmount("");
    setCategory("miscellaneous");
    setNotes("");
    setOpen(false);
    setLoading(false);
    onSuccess();
  }

  if (!open) {
    return (
      <button className="btn" onClick={() => setOpen(true)} style={{ width: "100%", justifyContent: "center", padding: 14, borderStyle: "dashed", color: "var(--text-tertiary)", fontSize: 14, gap: 8 }}>
        <Plus size={16} /> Add an expense
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: 20, animation: "scaleIn 0.2s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600 }}>New Expense</div>
        <Button variant="ghost" onClick={() => setOpen(false)} style={{ padding: "6px 10px" }} aria-label="Close">
          <X size={16} />
        </Button>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Title" htmlFor="extitle" required>
            <Input id="extitle" placeholder="e.g., Monthly Hosting" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </Field>
          <Field label="Amount (₹)" htmlFor="examount" required>
            <Input id="examount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
        </div>
        <Field label="Category" htmlFor="excat">
          <Select id="excat" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notes (optional)" htmlFor="exnotes">
          <Textarea id="exnotes" rows={2} placeholder="Additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button variant="primary" onClick={addExpense} loading={loading} disabled={!title.trim() || !amount} style={{ flex: 1 }}>
            {!loading && <Plus size={15} />} Add Expense
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} style={{ flex: 1 }}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
