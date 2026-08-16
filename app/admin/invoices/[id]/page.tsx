"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import GeneratePdfButton from "@/components/GeneratePdfButton";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { supabase } from "@/lib/supabase";
import {
  getInvoice,
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
  updateInvoiceStatus,
} from "@/lib/invoice-utils";
import type { InvoiceWithRelations, InvoiceStatus } from "@/lib/types/invoice";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      if (!id) return;
      const inv = await getInvoice(id as string);
      setInvoice(inv);
    } catch (e) {
      console.error("Failed to load invoice:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Load invoice when id changes
    if (!id) return;
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  const statusOptions: InvoiceStatus[] = ["draft", "sent", "paid", "overdue", "cancelled"];

  const amount = invoice ? formatCurrency(Number(invoice.total_amount || 0)) : "";

  async function handleStatusChange(nextStatus: InvoiceStatus) {
    if (!invoice) return;
    setSaving(true);
    try {
      // Update invoice status (payment_date handled in util)
      await updateInvoiceStatus(invoice.id, nextStatus);

      // Also log activity via existing activities table helper
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activities").insert([
          {
            user_id: user.id,
            user_name: user.email || "Unknown",
            action:
              nextStatus === "paid"
                ? `Invoice Paid ${invoice.invoice_number}`
                : `Invoice status updated to ${nextStatus} (${invoice.invoice_number})`,
            client_id: invoice.client_id,
            invoice_id: invoice.id,
          },
        ]);
      }

      const refreshed = await getInvoice(invoice.id);
      setInvoice(refreshed);
    } catch (e) {
      console.error("Failed to update invoice status:", e);
      alert("Failed to update invoice status");
    }
    setSaving(false);
  }

  async function handleDeleteInvoice() {
    if (!deleteInvoiceId) return;
    setSaving(true);
    try {
      await supabase.from("invoices").delete().eq("id", deleteInvoiceId);
      setInvoice((cur) => (cur && cur.id === deleteInvoiceId ? null : cur));
      setDeleteInvoiceId(null);
    } catch (e) {
      console.error("Failed to delete invoice:", e);
      alert("Failed to delete invoice");
    }
    setSaving(false);
  }

  return (
    <RoleGuard allowedRoles={["admin", "member"]}>
      <div style={{ maxWidth: "1100px", animation: "fadeUp 0.5s ease both" }}>
        {loading ? (
          <div style={{ padding: "40px" }}>Loading invoice…</div>
        ) : !invoice ? (
          <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--text-tertiary)" }}>
            Invoice not found.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "18px" }}>
              <div className="section-label" style={{ marginBottom: "8px" }}>
                Sales
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start" }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700 }}>
                    {invoice.invoice_number}
                  </h1>
                  <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                    {invoice.client?.company_name || "Unknown Client"}
                    {invoice.project?.name ? ` • ${invoice.project.name}` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>{invoice.status}</span>
                  <GeneratePdfButton type="invoice" data={invoice} />
                  <button className="btn" style={{ padding: "10px 14px" }} onClick={() => setDeleteInvoiceId(invoice.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
              <div className="card" style={{ padding: "22px" }}>
                <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                  <div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Due Date
                    </div>
                    <div>{formatDate(invoice.due_date)}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Payment Date
                    </div>
                    <div>{formatDate(invoice.payment_date)}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Total Amount
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "var(--accent)" }}>
                      {amount}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Title
                    </div>
                    <div>{invoice.title || "—"}</div>
                  </div>
                </div>

                {invoice.notes || invoice.terms ? (
                  <div style={{ marginTop: "18px", padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                    {invoice.notes ? (
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontWeight: 700, marginBottom: "6px" }}>Notes</div>
                        <div style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{invoice.notes}</div>
                      </div>
                    ) : null}
                    {invoice.terms ? (
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: "6px" }}>Terms & Conditions</div>
                        <div style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{invoice.terms}</div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "16px" }}>Invoice Items</div>
                    <div style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "13px" }}>Line items included in this invoice</div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <select className="input" value={invoice.status} onChange={(e) => void handleStatusChange(e.target.value as InvoiceStatus)} disabled={saving} style={{ minWidth: "180px" }}>
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {invoice.items?.length ? (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {invoice.items.map((it) => (
                      <div key={it.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{it.title}</div>
                          {it.description ? <div style={{ color: "var(--text-tertiary)", fontSize: "13px", marginTop: "4px" }}>{it.description}</div> : null}
                        </div>
                        <div>Qty {it.quantity}</div>
                        <div>₹{Number(it.unit_price || 0).toLocaleString("en-IN")}</div>
                        <div style={{ fontWeight: 900 }}>₹{Number(it.total || 0).toLocaleString("en-IN")}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--text-tertiary)" }}>No items.</div>
                )}

                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--accent-dim)" }}>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Total
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 900, color: "var(--accent)" }}>
                      {amount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ConfirmDeleteModal
              open={Boolean(deleteInvoiceId)}
              title="Delete invoice"
              description="This will permanently delete the invoice and its items."
              confirmLabel="Delete invoice"
              loading={saving}
              onConfirm={handleDeleteInvoice}
              onCancel={() => setDeleteInvoiceId(null)}
            />
          </>
        )}
      </div>
    </RoleGuard>
  );
}

