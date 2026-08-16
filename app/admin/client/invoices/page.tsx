"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { getInvoicesByClient } from "@/lib/invoice-utils";
import type { InvoiceWithRelations } from "@/lib/types/invoice";

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadInvoices() {
      const currentClient = await getCurrentClientUser();
      if (!mounted || !currentClient) {
        setLoading(false);
        return;
      }

      const invoicesRes = await getInvoicesByClient(currentClient.client_id);
      if (mounted) {
        setInvoices(invoicesRes);
        setLoading(false);
      }
    }

    void loadInvoices();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-slate-900 p-8 rounded-xl">Loading invoices…</div>
      </div>
    );
  }

  const outstanding = invoices.filter((invoice) => invoice.status !== "paid").length;
  const paid = invoices.filter((invoice) => invoice.status === "paid").length;

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ marginBottom: "20px" }}>
        <div className="section-label">Invoices</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700 }}>
          Invoice history
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Review invoices and download payment-ready documents.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "22px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Outstanding invoices
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700 }}>{outstanding}</div>
        </div>
        <div className="card" style={{ padding: "22px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Paid invoices
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700 }}>{paid}</div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="card" style={{ padding: "32px", color: "var(--text-tertiary)" }}>
          No invoices are available for your account yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/admin/client/invoices/${invoice.id}`}
              className="card card-interactive"
              style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr auto", gap: "18px", alignItems: "center" }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700 }}>{invoice.invoice_number}</div>
                <div style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "13px" }}>
                  Due {invoice.due_date || "N/A"} · {invoice.status}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>₹{Number(invoice.total_amount || 0).toLocaleString("en-IN")}</div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>{invoice.project?.name || "Project not assigned"}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
