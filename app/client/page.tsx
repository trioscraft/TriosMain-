"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { getInvoicesByClient, getQuotationsByClient } from "@/lib/invoice-utils";
import type { InvoiceWithRelations, QuotationWithRelations } from "@/lib/types/invoice";
import type { Client, Project } from "@/lib/types/admin/client";
import StatusChip from "@/components/StatusChip";
import {
  FolderKanban,
  CheckCircle2,
  ReceiptText,
  Wallet,
  ArrowRight,
  Clock,
  CalendarDays,
  AlertCircle,
  MessageSquare,
  BarChart3,
} from "lucide-react";

function formatINR(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

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
      <div className="cp-loading">
        <div className="cp-loading-spinner" />
        Loading your dashboard…
      </div>
    );
  }

  const activeProjects = projects.filter((project) => project.status === "active").length;
  const completedProjects = projects.filter((project) => project.status === "completed").length;
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "paid").length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid").length;

  const outstandingAmount = invoices
    .filter((invoice) => invoice.status !== "paid")
    .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.due_date && new Date(invoice.due_date) < new Date()
  ).length;

  const firstName =
    clientInfo?.company_name || "Valued Client";

  const stats = [
    { label: "Active Projects", value: activeProjects, icon: FolderKanban },
    { label: "Completed Projects", value: completedProjects, icon: CheckCircle2 },
    { label: "Pending Invoices", value: pendingInvoices, icon: Clock },
    { label: "Outstanding", value: formatINR(outstandingAmount), icon: Wallet, colored: true },
  ];

  const quickLinks = [
    { href: "/client/projects", label: "View projects", icon: FolderKanban, desc: `${projects.length} project${projects.length !== 1 ? "s" : ""} linked to your account` },
    { href: "/client/invoices", label: "Invoices & payments", icon: ReceiptText, desc: `${pendingInvoices} pending, ${paidInvoices} paid` },
    { href: "/client/messages", label: "Message the team", icon: MessageSquare, desc: "Replies in one thread" },
    { href: "/client/reports", label: "Download reports", icon: BarChart3, desc: "Project & invoice summaries" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      {/* Hero */}
      <div className="cp-hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="cp-hero-eyebrow">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent-glow)",
              }}
            />
            Client Dashboard
          </div>
          <h1>
            Welcome back, <span>{firstName}</span>
          </h1>
          <p>
            Track your active projects, invoices, messages, and reports in one place.
            Everything you need to stay in the loop lives here.
          </p>
          <div className="cp-hero-actions">
            <Link
              href="/client/projects"
              className="btn btn-primary"
              style={{ padding: "12px 22px" }}
            >
              <FolderKanban size={16} /> View projects
            </Link>
          </div>
        </div>
      </div>

      {/* Payment due banner */}
      {pendingInvoices > 0 && (
        <div className={`cp-banner ${overdueInvoices > 0 ? "urgent" : ""}`}>
          <AlertCircle size={18} style={{ color: overdueInvoices > 0 ? "var(--red)" : "var(--accent)", flexShrink: 0 }} />
          <span>
            {overdueInvoices > 0
              ? `${overdueInvoices} invoice${overdueInvoices !== 1 ? "s" : ""} past due — please review your balance.`
              : `${pendingInvoices} invoice${pendingInvoices !== 1 ? "s" : ""} awaiting payment.`}
          </span>
          <span className="cp-banner-amount">{formatINR(outstandingAmount)}</span>
          <Link href="/client/invoices" className="btn" style={{ padding: "8px 16px", fontSize: 13, marginLeft: 4 }}>
            Review <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="cp-stats">
        {stats.map(({ label, value, icon: Icon, colored }, i) => (
          <div
            key={label}
            className="cp-stat"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="cp-stat-icon">
              <Icon size={20} strokeWidth={2} />
            </div>
            <div className="cp-stat-label">{label}</div>
            <div className={`cp-stat-value${colored ? " colored" : ""}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {quickLinks.map(({ href, label, icon: Icon, desc }, i) => (
          <Link
            key={href}
            href={href}
            className="cp-row"
            style={{ flexDirection: "column", alignItems: "flex-start", gap: 12, padding: "18px 20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
              <div className="cp-project-icon" style={{ width: 40, height: 40 }}>
                <Icon size={18} />
              </div>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
              <ArrowRight size={15} style={{ color: "var(--text-tertiary)", marginLeft: "auto" }} />
            </div>
            <div style={{ color: "var(--text-tertiary)", fontSize: 12.5, lineHeight: 1.5 }}>{desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent projects */}
      <div className="cp-card" style={{ marginBottom: "20px" }}>
        <div className="cp-card-head">
          <div>
            <div className="cp-card-title">Recent projects</div>
            <div className="cp-card-subtitle">
              Your latest project updates and progress details.
            </div>
          </div>
          {projects.length > 0 && (
            <Link
              href="/client/projects"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              View all <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <FolderKanban size={24} />
            </div>
            No active projects have been linked to your account yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {projects.slice(0, 4).map((project) => (
              <Link
                key={project.id}
                href={`/client/projects/${project.id}`}
                className="cp-project-card"
                style={{ textDecoration: "none", color: "inherit", display: "grid", gap: 0 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div className="cp-project-icon">
                      <FolderKanban size={19} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 16,
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
                        <CalendarDays size={13} /> Due {project.due_date || "—"}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 20,
                      }}
                    >
                      {project.progress}%
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <StatusChip status={project.status} />
                    </div>
                  </div>
                </div>
                <div className="cp-progress">
                  <div
                    className={`cp-progress-fill ${project.status === "completed" ? "done" : ""}`}
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Invoices + quotations snapshot */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="cp-card">
          <div className="cp-card-head">
            <div>
              <div className="cp-card-title">Invoice snapshot</div>
              <div className="cp-card-subtitle">Your most recent invoices.</div>
            </div>
            <Link
              href="/client/invoices"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {invoices.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <ReceiptText size={24} />
              </div>
              No invoices are available yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {invoices.slice(0, 3).map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/client/invoices/${invoice.id}`}
                  className="cp-row"
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{invoice.invoice_number}</div>
                    <div style={{ marginTop: 5 }}>
                      <StatusChip status={invoice.status} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="cp-amount">{formatINR(invoice.total_amount)}</div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: 12, marginTop: 4 }}>
                      {invoice.due_date || "No due date"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="cp-card">
          <div className="cp-card-head">
            <div>
              <div className="cp-card-title">Quotation activity</div>
              <div className="cp-card-subtitle">Recent quotations shared with you.</div>
            </div>
          </div>

          {quotations.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <ReceiptText size={24} />
              </div>
              No quotations have been shared yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {quotations.slice(0, 3).map((quotation) => (
                <div key={quotation.id} className="cp-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{quotation.quotation_number}</div>
                    <div style={{ marginTop: 5 }}>
                      <StatusChip status={quotation.status} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="cp-amount">{formatINR(quotation.amount)}</div>
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