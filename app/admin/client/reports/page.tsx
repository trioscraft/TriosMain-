"use client";

import { useEffect, useState } from "react";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";

type ReportProject = {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  due_date: string | null;
};

type ReportInvoice = {
  id: string;
  invoice_number: string;
  status: string;
  due_date: string | null;
  total_amount: number;
};

export default function ClientReportsPage() {
  const [projects, setProjects] = useState<ReportProject[]>([]);
  const [invoices, setInvoices] = useState<ReportInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      const currentClient = await getCurrentClientUser();
      if (!mounted || !currentClient) {
        setLoading(false);
        return;
      }

      const [projectsRes, invoicesRes] = await Promise.all([
        supabase
          .from("projects")
          .select("id, name, status, start_date, due_date")
          .eq("client_id", currentClient.client_id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("id, invoice_number, status, due_date, total_amount")
          .eq("client_id", currentClient.client_id)
          .order("updated_at", { ascending: false }),
      ]);

      if (!mounted) return;
      setProjects(projectsRes.data || []);
      setInvoices(invoicesRes.data || []);
      setLoading(false);
    }

    void loadReports();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-slate-900 p-8 rounded-xl">Loading reports…</div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ marginBottom: "20px" }}>
        <div className="section-label">Reports</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700 }}>
          Download your client reports
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Generate quick project and invoice summaries optimized for printing or PDF export.
        </p>
      </div>

      <div style={{ display: "grid", gap: "18px" }}>
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700 }}>Project reports</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                Download printable summaries for your open projects.
              </p>
            </div>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: "12px 20px" }}>
              Download PDF
            </button>
          </div>

          {projects.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)" }}>No project reports are available yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {projects.map((project) => (
                <div key={project.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{project.name}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{project.status}</div>
                  </div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>
                    Due {project.due_date || "TBD"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700 }}>Invoice reports</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                Export a PDF-ready invoice summary for billing and payment tracking.
              </p>
            </div>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: "12px 20px" }}>
              Download PDF
            </button>
          </div>

          {invoices.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)" }}>No invoice reports are available yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {invoices.map((invoice) => (
                <div key={invoice.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{invoice.invoice_number}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{invoice.status}</div>
                  </div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>
                    ₹{Number(invoice.total_amount || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
