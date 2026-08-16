"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import EditExpenseModal, { type ExpenseData } from "./EditExpenseModal";

type ExpenseWithProfile = ExpenseData & {
  created_at: string;
  profiles?: { name: string } | null;
};

type ExpenseListProps = {
  expenses: ExpenseWithProfile[];
  projectId: string;
  projectName: string;
  onExpensesChange: () => void;
};

function formatTimeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export default function ExpenseList({
  expenses,
  projectId,
  projectName,
  onExpensesChange,
}: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseData | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deletingExpense) return;

    setDeleting(true);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      alert("You must be logged in to delete expenses.");
      setDeleting(false);
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", deletingExpense.id);

    if (error) {
      alert(error.message);
      setDeleting(false);
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
      action: `deleted expense: ${deletingExpense.title} (₹${deletingExpense.amount.toLocaleString("en-IN")})`,
      projectId,
      projectName,
    });

    setDeleting(false);
    setDeletingExpense(null);
    onExpensesChange();
  }

  if (expenses.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--text-tertiary)",
          fontSize: "14px",
        }}
      >
        No expenses yet. Add one above to get started.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {expenses.map((expense, i) => (
          <div
            key={expense.id}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              animation: `fadeUp 0.3s ${i * 30}ms ease both`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  background: "var(--red-dim)",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                💸
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--text-primary)",
                  }}
                >
                  {expense.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <span>
                    {formatTimeAgo(expense.created_at)}
                  </span>
                  {expense.profiles?.name && (
                    <>
                      <span>•</span>
                      <span>by {expense.profiles.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--red)",
                  letterSpacing: "-0.02em",
                }}
              >
                -₹{Number(expense.amount).toLocaleString("en-IN")}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="btn"
                  onClick={() => setEditingExpense(expense)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                  }}
                  title="Edit expense"
                >
                  ✏️
                </button>
                <button
                  className="btn"
                  onClick={() => setDeletingExpense(expense)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "var(--red)",
                  }}
                  title="Delete expense"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingExpense && (
        <EditExpenseModal
          open={!!editingExpense}
          expense={editingExpense}
          projectName={projectName}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null);
            onExpensesChange();
          }}
        />
      )}

      {deletingExpense && (
        <ConfirmDeleteModal
          open={!!deletingExpense}
          title="Delete Expense"
          description={`Are you sure you want to delete "${deletingExpense.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingExpense(null)}
        />
      )}
    </>
  );
}