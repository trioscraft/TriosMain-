"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { getInvoicesByClient, getQuotationsByClient } from "@/lib/invoice-utils";
import type { InvoiceWithRelations, QuotationWithRelations } from "@/lib/types/invoice";
import type { Client, Project } from "@/lib/types/admin/client";


export default function ClientDashboardPage() {
  const [clientInfo, setClientInfo] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [quotations, setQuotations] = useState<QuotationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const currentClient = await getCurrentClientUser();
      if (!mounted || !currentClient) {
        setLoading(false);
        return;
      }

      const [clientRes, projectsRes, invoicesRes, quotationsRes] = await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .eq("id", currentClient.client_id)
          .single(),
        supabase
          .from("projects")
          .select("id, name, start_date, due_date, progress, status")
          .eq("client_id", currentClient.client_id)
          .order("created_at", { ascending: false }),
        getInvoicesByClient(currentClient.client_id),
        getQuotationsByClient(currentClient.client_id),
      ]);

      if (mounted) {
        setClientInfo(clientRes.data || null);
        setProjects(projectsRes.data || []);
        setInvoices(invoicesRes);
        setQuotations(quotationsRes);
        setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-slate-900 p-8 rounded-xl">Loading your client dashboard…</div>
      </div>
    );
  }

  const activeProjects = projects.filter((project) => project.status === "active").length;
  const completedProjects = projects.filter((project) => project.status === "completed").length;
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "paid").length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid").length;

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ marginBottom: "22px" }}>
        <div className="section-label">Client Dashboard</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, marginTop: "8px" }}>
          Welcome back,
          <span style={{ color: "var(--accent)" }}>
            {clientInfo?.company_name || "Valued Client"}
          </span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Track your active projects, invoices, messages, and reports in one place.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Active Projects", value: activeProjects, accent: "var(--accent)" },
          { label: "Completed Projects", value: completedProjects, accent: "var(--green)" },
          { label: "Pending Invoices", value: pendingInvoices, accent: "var(--amber)" },
          { label: "Paid Invoices", value: paidInvoices, accent: "var(--purple)" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "22px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: stat.accent }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700 }}>Recent projects</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                Your latest project updates and progress details.
              </p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)", padding: "24px 0" }}>
              No active projects have been linked to your account yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700 }}>{project.name}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "6px" }}>
                        Status: {project.status} · Progress: {project.progress}%
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "120px" }}>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>Start</div>
                      <div style={{ marginTop: "4px" }}>{project.start_date || "—"}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "10px" }}>Due</div>
                      <div style={{ marginTop: "4px" }}>{project.due_date || "—"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "14px" }}>Invoice snapshot</h2>
            {invoices.length === 0 ? (
              <div style={{ color: "var(--text-tertiary)" }}>No invoices are available yet.</div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{invoice.invoice_number}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>{invoice.status}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>₹{Number(invoice.total_amount || 0).toLocaleString("en-IN")}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>{invoice.due_date || "No due date"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "14px" }}>Quotation activity</h2>
            {quotations.length === 0 ? (
              <div style={{ color: "var(--text-tertiary)" }}>No quotations have been shared yet.</div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {quotations.slice(0, 3).map((quotation) => (
                  <div key={quotation.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{quotation.quotation_number}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>{quotation.status}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>₹{Number(quotation.amount || 0).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
