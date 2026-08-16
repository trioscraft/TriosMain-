"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import {
  getAllInvoices,
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
  getDashboardMetrics,
} from "@/lib/invoice-utils";
import type { InvoiceWithRelations, InvoiceStatus } from "@/lib/types/invoice";

const statusOptions: Array<{ value: "all" | InvoiceStatus; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");

  const [metrics, setMetrics] = useState({
    outstandingInvoices: 0,
    paidInvoices: 0,
    totalRevenue: 0,
    overdueAmount: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      try {
        const [invoicesData, metricsData] = await Promise.all([
          getAllInvoices(),
          getDashboardMetrics(),
        ]);
        if (!mounted) return;

        setInvoices(invoicesData);
        setMetrics({
          outstandingInvoices: metricsData.outstandingInvoices,
          paidInvoices: metricsData.paidInvoices,
          totalRevenue: metricsData.totalRevenue,
          overdueAmount: metricsData.overdueAmount,
        });
      } catch (e) {
        console.error("Failed to load invoices:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void run();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesSearch =
        !query ||
        inv.invoice_number.toLowerCase().includes(query) ||
        inv.client?.company_name?.toLowerCase().includes(query) ||
        (inv.title || "").toLowerCase().includes(query) ||
        inv.project?.name?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalCount = invoices.length;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "1100px", animation: "fadeUp 0.5s ease both" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: "8px" }}>
              Sales
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              Invoices
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>
              {totalCount} invoice{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Outstanding Invoices
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--amber)",
              }}
            >
              {metrics.outstandingInvoices}
            </div>
          </div>

          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Paid Invoices
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--green)",
              }}
            >
              {metrics.paidInvoices}
            </div>
          </div>

          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Total Revenue
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {formatCurrency(metrics.totalRevenue)}
            </div>
          </div>

          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Overdue Amount
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--red)",
              }}
            >
              {formatCurrency(metrics.overdueAmount)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <input
            className="input"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | InvoiceStatus)}
            style={{ width: "170px" }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "grid", gap: "14px" }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="skeleton"
                style={{ height: "100px", animationDelay: `${index * 80}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>🧾</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "18px",
                marginBottom: "8px",
              }}
            >
              No invoices found
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Create or convert a quotation to generate invoices.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {filtered.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/admin/invoices/${invoice.id}`}
                className="card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  padding: "20px 24px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "16px",
                        fontWeight: 700,
                      }}
                    >
                      {invoice.invoice_number}
                    </div>
                    <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>{invoice.status}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    {invoice.client?.company_name || "Unknown Client"}
                  </div>
                  {invoice.title && (
                    <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>{invoice.title}</div>
                  )}
                  {invoice.project?.name && (
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                      {invoice.project.name}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--accent)",
                    }}
                  >
                    {formatCurrency(Number(invoice.total_amount || 0))}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {formatDate(invoice.due_date)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

