"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

const EXPENSE_CATEGORIES = [
  { value: "hosting", label: "Hosting" },
  { value: "domain", label: "Domain" },
  { value: "api_costs", label: "API Costs" },
  { value: "advertising", label: "Advertising" },
  { value: "freelancer", label: "Freelancer Payments" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export default function AddExpenseForm({
  projectId,
  projectName,
  onSuccess,
}: {
  projectId: string;
  projectName: string;
  onSuccess: () => void;
}) {
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

    const expenseTitle = `${title.trim()}`;
    const numericAmount = parseFloat(amount);

    const { error } = await supabase
      .from("expenses")
      .insert([
        {
          project_id: projectId,
          title: expenseTitle,
          amount: numericAmount,
          notes: notes.trim() || null,
          created_by: user.id,
        },
      ]);

    if (error) {
      alert(error.message);
      setLoading(false);
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
      action: `added expense: ${expenseTitle} (₹${numericAmount.toLocaleString("en-IN")})`,
      projectId,
      projectName,
    });

    setTitle("");
    setAmount("");
    setCategory("miscellaneous");
    setNotes("");
    setOpen(false);
    setLoading(false);
    onSuccess();
  }

  return (
    <>
      <style>{`
        .add-expense-form {
          transition: all 0.25s ease;
        }
      `}</style>

      {!open ? (
        <button
          className="btn"
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "14px",
            borderStyle: "dashed",
            color: "var(--text-tertiary)",
            fontSize: "14px",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              lineHeight: 1,
            }}
          >
            +
          </span>
          Add an expense
        </button>
      ) : (
        <div
          className="card add-expense-form"
          style={{
            padding: "20px",
            animation: "scaleIn 0.2s ease both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              New Expense
            </div>
            <button
              className="btn"
              onClick={() => setOpen(false)}
              style={{
                flexShrink: 0,
                color: "var(--text-tertiary)",
                padding: "6px 10px",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
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
                  placeholder="e.g., Monthly Hosting"
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
                  placeholder="0.00"
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
                Category
              </label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
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
                placeholder="Additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                className="btn btn-primary"
                onClick={addExpense}
                disabled={loading || !title.trim() || !amount}
                style={{
                  opacity: !title.trim() || !amount ? 0.5 : 1,
                }}
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
              <button
                className="btn"
                onClick={() => setOpen(false)}
                style={{
                  color: "var(--text-tertiary)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}