"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";
import type { InvoiceWithRelations } from "@/lib/types/invoice";
import StatusChip from "@/components/StatusChip";
import { ArrowLeft, ReceiptText, Printer, IndianRupee } from "lucide-react";

function formatINR(amount: number) {
  return `\u20B9${Number(amount || 0).toLocaleString("en-IN")}`;
}

export default function ClientInvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadInvoice() {
      const currentClient = await getCurrentClientUser();
      if (!mounted || !currentClient || !id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("invoices")
        .select("*, client(id, company_name), project(id, name), invoice_items(*)")
        .eq("id", id)
        .eq("client_id", currentClient.client_id)
        .single();

      if (!error) {
        setInvoice(data as InvoiceWithRelations);
      }
      setLoading(false);
    }

    void loadInvoice();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="cp-loading">
        <div className="cp-loading-spinner" />
        Loading invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="cp-card" style={{ padding: 30 }}>
        <div className="cp-empty">
          <div className="cp-empty-icon">
            <ReceiptText size={24} />
          </div>
          Invoice not found or you do not have permission to view it.
        </div>
      </div>
    );
  }

  const items = invoice.invoice_items || [];

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <Link
        href="/client/invoices"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--text-secondary)",
          textDecoration: "none",
          marginBottom: 18,
        }}
      >
        <ArrowLeft size={15} /> Back to invoices
      </Link>

      <div className="cp-header" style={{ marginBottom: 22 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Invoice detail
          </div>
          <h1>{invoice.invoice_number}</h1>
          <div style={{ marginTop: 10 }}>
            <StatusChip status={invoice.status} />
          </div>
        </div>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: "12px 20px" }}>
          <Printer size={15} /> Download Invoice PDF
        </button>
      </div>

      <div className="cp-card" style={{ marginBottom: 20 }}>
        <div className="cp-meta-grid">
          <div>
            <div className="cp-meta-label">Billed to</div>
            <div className="cp-meta-value" style={{ fontWeight: 600 }}>
              {invoice.client?.company_name || "Client"}
            </div>
          </div>
          <div>
            <div className="cp-meta-label">Project</div>
            <div className="cp-meta-value">{invoice.project?.name || "Unassigned"}</div>
          </div>
          <div>
            <div className="cp-meta-label">Due date</div>
            <div className="cp-meta-value">{invoice.due_date || "Not set"}</div>
          </div>
          <div>
            <div className="cp-meta-label">Total</div>
            <div className="cp-meta-value big">{formatINR(invoice.total_amount)}</div>
          </div>
        </div>
      </div>

      <div className="cp-card">
        <div className="cp-card-head">
          <div>
            <div className="cp-card-title">Invoice items</div>
            <div className="cp-card-subtitle">Review the charges included in this invoice.</div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <IndianRupee size={24} />
            </div>
            No line items were added to this invoice.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="cp-table">
              <thead>
                <tr>
                  <th style={{ width: "46%" }}>Description</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      {item.description ? (
                        <div style={{ color: "var(--text-tertiary)", fontSize: 13, marginTop: 3 }}>
                          {item.description}
                        </div>
                      ) : null}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{item.quantity}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{formatINR(item.unit_price)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{formatINR(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px solid var(--glass-border)",
              }}
            >
              <div style={{ minWidth: 240, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: 13.5 }}>
                  <span>Subtotal</span>
                  <span>{formatINR(invoice.amount || 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: 13.5 }}>
                  <span>Tax</span>
                  <span>{formatINR(invoice.tax_amount || 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: 13.5 }}>
                  <span>Discount</span>
                  <span>- {formatINR(invoice.discount_amount || 0)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-display)",
                    fontSize: 20,
                    fontWeight: 700,
                    paddingTop: 10,
                    borderTop: "1px solid var(--glass-border)",
                    color: "var(--accent)",
                  }}
                >
                  <span>Total</span>
                  <span>{formatINR(invoice.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}