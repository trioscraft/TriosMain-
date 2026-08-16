"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";
import type { InvoiceWithRelations } from "@/lib/types/invoice";

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
        .select(`
          *,
          client(id, company_name),
          project(id, name),
          invoice_items(*)
        `)
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
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-slate-900 p-8 rounded-xl">Loading invoice…</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="card" style={{ padding: "30px", color: "var(--text-tertiary)" }}>
        Invoice not found or you do not have permission to view it.
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ marginBottom: "20px" }}>
        <div className="section-label">Invoice detail</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700 }}>{invoice.invoice_number}</h1>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
        <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
              Project
            </div>
            <div>{invoice.project?.name || "Unassigned"}</div>
          </div>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
              Status
            </div>
            <div>{invoice.status}</div>
          </div>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
              Due date
            </div>
            <div>{invoice.due_date || "Not set"}</div>
          </div>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
              Total
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700 }}>₹{Number(invoice.total_amount || 0).toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700 }}>Invoice items</div>
            <div style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
              Review the charges included in this invoice.
            </div>
          </div>
          <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: "12px 20px" }}>
            Download Invoice PDF
          </button>
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          {(invoice.invoice_items || []).map((item) => (
            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>{item.description || ""}</div>
              </div>
              <div>Qty {item.quantity}</div>
              <div>₹{Number(item.unit_price || 0).toLocaleString("en-IN")}</div>
              <div style={{ fontWeight: 700 }}>₹{Number(item.total || 0).toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
