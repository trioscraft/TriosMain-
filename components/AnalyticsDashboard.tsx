"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AnalyticsData } from "@/lib/types/analytics";
import ClientAnalytics from "@/components/ClientAnalytics";
import ProjectAnalytics from "@/components/ProjectAnalytics";
import ProfitChart from "@/components/ProfitChart";
import RevenueChart from "@/components/RevenueChart";
import TimeAnalytics from "@/components/TimeAnalytics";
import TopContributors from "@/components/TopContributors";

export default function AnalyticsDashboard({ initialData }: { initialData: AnalyticsData }) {
  const [analytics, setAnalytics] = useState(initialData);
  const [loading, setLoading] = useState(false);

  async function refreshAnalytics() {
    setLoading(true);
    try {
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error("Failed to load analytics");
      }
      const result = (await response.json()) as AnalyticsData;
      setAnalytics(result);
    } catch (error) {
      console.error("Analytics refresh failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel("analytics-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "projects" },
        refreshAnalytics
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects" },
        refreshAnalytics
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        refreshAnalytics
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        refreshAnalytics
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "expenses" },
        refreshAnalytics
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "time_entries" },
        refreshAnalytics
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "invoices" },
        refreshAnalytics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cards = [
    { label: "Total Revenue", value: `₹${analytics.totalRevenue.toLocaleString("en-IN")}`, color: "var(--amber)" },
    { label: "Total Expenses", value: `₹${analytics.totalExpenses.toLocaleString("en-IN")}`, color: "var(--red)" },
    { label: "Total Profit", value: `₹${analytics.totalProfit.toLocaleString("en-IN")}`, color: "var(--green)" },
    { label: "Active Projects", value: analytics.activeProjects, color: "var(--accent)" },
    { label: "Completed Projects", value: analytics.completedProjects, color: "var(--green)" },
    { label: "Open Tasks", value: analytics.openTasks, color: "var(--amber)" },
    { label: "Completed Tasks", value: analytics.completedTasks, color: "var(--green)" },
    { label: "Total Clients", value: analytics.totalClients, color: "var(--purple)" },
    { label: "Total Team Members", value: analytics.totalTeamMembers, color: "var(--accent)" },
    { label: "Total Hours Logged", value: `${analytics.totalHoursLogged.toFixed(1)}h`, color: "var(--green)" },
  ];

  return (
    <div style={{ maxWidth: "1300px", padding: "0 4px" }}>
      <div style={{ marginBottom: "28px" }}>
        <div className="section-label">Management Intelligence</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: "34px", fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              TriosFlow Analytics
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px", maxWidth: "720px" }}>
              Complete business intelligence for revenue, profitability, team productivity, clients, and project performance.
            </p>
          </div>

          <button
            onClick={refreshAnalytics}
            className="btn btn-primary"
            style={{ minWidth: "180px" }}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh analytics"}
          </button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
        {cards.map((card) => (
          <div key={card.label} className="card" style={{ padding: "22px", border: `1px solid ${card.color}22` }}>
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "10px" }}>
              {card.label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="grid gap-4" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <RevenueChart
          daily={analytics.revenueTrendDaily}
          weekly={analytics.revenueTrendWeekly}
          monthly={analytics.revenueTrendMonthly}
        />
        <ProfitChart
          trend={analytics.profitTrendMonthly}
          expenseBreakdown={analytics.expenseBreakdown}
          completionRate={analytics.projectCompletionRate}
          forecast={analytics.forecast}
        />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <TopContributors contributors={analytics.teamProductivity} />
        <TimeAnalytics stats={analytics.timeAnalytics} />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <ClientAnalytics clients={analytics.clientRevenueDistribution} />
        <ProjectAnalytics projects={analytics.projectAnalytics} />
      </div>
    </div>
  );
}
