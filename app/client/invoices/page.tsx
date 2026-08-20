"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { getInvoicesByClient } from "@/lib/invoice-utils";
import type { InvoiceWithRelations } from "@/lib/types/invoice";
import StatusChip from "@/components/StatusChip";
import { ReceiptText, AlertCircle, CheckCircle2, ArrowRight, FileDown, Wallet } from "lucide-react";

function formatINR(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

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
      <div className="cp-skeleton-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="cp-skeleton-card" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  const outstanding = invoices.filter((invoice) => invoice.status !== "paid").length;
  const paid = invoices.filter((invoice) => invoice.status === "paid").length;
  const outstandingAmount = invoices
    .filter((invoice) => invoice.status !== "paid")
    .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);

  const stats = [
    { label: "Outstanding invoices", value: outstanding, icon: AlertCircle },
    { label: "Paid invoices", value: paid, icon: CheckCircle2 },
    { label: "Total outstanding", value: formatINR(outstandingAmount), icon: Wallet, colored: true },
  ];

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div className="cp-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Invoices
          </div>
          <h1>Invoice history</h1>
          <p>Review invoices and download payment-ready documents.</p>
        </div>
      </div>

      <div className="cp-stats" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {stats.map(({ label, value, icon: Icon, colored }, i) => (
          <div key={label} className="cp-stat" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="cp-stat-icon">
              <Icon size={20} strokeWidth={2} />
            </div>
            <div className="cp-stat-label">{label}</div>
            <div className={`cp-stat-value${colored ? " colored" : ""}`}>{value}</div>
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="cp-card">
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <ReceiptText size={24} />
            </div>
            No invoices are available for your account yet.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="cp-row"
              style={{ padding: "18px 20px", alignItems: "center" }}
            >
              <Link
                href={`/client/invoices/${invoice.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--accent-soft)",
                    border: "1px solid var(--border-accent)",
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  <ReceiptText size={19} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700 }}>
                    {invoice.invoice_number}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7, flexWrap: "wrap" }}>
                    <StatusChip status={invoice.status} />
                    <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
                      {invoice.project?.name || "Project not assigned"}
                    </span>
                  </div>
                </div>
              </Link>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="cp-amount" style={{ fontSize: 19 }}>
                  {formatINR(invoice.total_amount)}
                </div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 12.5, marginTop: 5 }}>
                  Due {invoice.due_date || "N/A"}
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="btn"
                style={{ padding: "9px 14px", fontSize: 13, flexShrink: 0 }}
                title="Print / save as PDF"
              >
                <FileDown size={14} /> PDF
              </button>
              <ArrowRight
                size={17}
                style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}