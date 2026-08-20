"use client";

import { useEffect, useState } from "react";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";
import StatusChip from "@/components/StatusChip";
import { FolderKanban, ReceiptText, Printer, FileDown, CalendarDays, Wallet, Files } from "lucide-react";

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

function formatINR(amount: number) {
  return `\u20B9${Number(amount || 0).toLocaleString("en-IN")}`;
}

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
          .order("created_at", { ascending: false }),
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
      <div className="cp-loading">
        <div className="cp-loading-spinner" />
        Loading reports...
      </div>
    );
  }

  const outstandingTotal = invoices
    .filter((invoice) => invoice.status !== "paid")
    .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div className="cp-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Reports
          </div>
          <h1>Download your client reports</h1>
          <p>
            Generate quick project and invoice summaries optimized for printing or PDF export.
          </p>
        </div>
      </div>

      <div className="cp-stats" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="cp-stat">
          <div className="cp-stat-icon">
            <Files size={20} />
          </div>
          <div className="cp-stat-label">Projects</div>
          <div className="cp-stat-value">{projects.length}</div>
        </div>
        <div className="cp-stat">
          <div className="cp-stat-icon">
            <ReceiptText size={20} />
          </div>
          <div className="cp-stat-label">Invoices</div>
          <div className="cp-stat-value">{invoices.length}</div>
        </div>
        <div className="cp-stat">
          <div className="cp-stat-icon">
            <Wallet size={20} />
          </div>
          <div className="cp-stat-label">Outstanding</div>
          <div className="cp-stat-value colored">{formatINR(outstandingTotal)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Project reports */}
        <div className="cp-report-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="cp-report-icon" style={{ marginBottom: 0 }}>
                <FolderKanban size={20} />
              </div>
              <div>
                <div className="cp-card-title">Project reports</div>
                <div className="cp-card-subtitle">
                  Download printable summaries for your open projects.
                </div>
              </div>
            </div>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: "12px 20px" }}>
              <Printer size={15} /> Download PDF
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <FolderKanban size={24} />
              </div>
              No project reports are available yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{project.name}</div>
                    <div style={{ marginTop: 5 }}>
                      <StatusChip status={project.status} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", fontSize: 13 }}>
                      <CalendarDays size={14} /> Due {project.due_date || "TBD"}
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="btn"
                      style={{ padding: "8px 14px", fontSize: 13 }}
                    >
                      <FileDown size={14} /> Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice reports */}
        <div className="cp-report-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="cp-report-icon" style={{ marginBottom: 0 }}>
                <ReceiptText size={20} />
              </div>
              <div>
                <div className="cp-card-title">Invoice reports</div>
                <div className="cp-card-subtitle">
                  Export a PDF-ready invoice summary for billing and payment tracking.
                </div>
              </div>
            </div>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: "12px 20px" }}>
              <Printer size={15} /> Download PDF
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <ReceiptText size={24} />
              </div>
              No invoice reports are available yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{invoice.invoice_number}</div>
                    <div style={{ marginTop: 5 }}>
                      <StatusChip status={invoice.status} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--accent)" }}>
                      {formatINR(invoice.total_amount)}
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="btn"
                      style={{ padding: "8px 14px", fontSize: 13 }}
                    >
                      <FileDown size={14} /> Export
                    </button>
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