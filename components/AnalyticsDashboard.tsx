"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Briefcase,
  CheckCircle2,
  ListTodo,
  Users,
  UserCog,
  Clock,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AnalyticsData } from "@/lib/types/analytics";
import Button from "@/components/admin/ui/Button";
import { StatCard } from "@/components/admin/ui/StatCard";
import { PageHeader } from "@/components/admin/ui/Card";
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
      if (!response.ok) throw new Error("Failed to load analytics");
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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "projects" }, refreshAnalytics)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "projects" }, refreshAnalytics)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, refreshAnalytics)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, refreshAnalytics)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "expenses" }, refreshAnalytics)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "time_entries" }, refreshAnalytics)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "invoices" }, refreshAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const cards = [
    { label: "Total Revenue", value: fmt(analytics.totalRevenue), icon: <IndianRupee size={17} />, tone: "up" as const, color: "var(--amber)" },
    { label: "Total Expenses", value: fmt(analytics.totalExpenses), icon: <TrendingDown size={17} />, tone: "down" as const, color: "var(--red)" },
    { label: "Total Profit", value: fmt(analytics.totalProfit), icon: <TrendingUp size={17} />, tone: "up" as const, color: "var(--green)" },
    { label: "Active Projects", value: analytics.activeProjects, icon: <Briefcase size={17} />, tone: "flat" as const, color: "var(--accent)" },
    { label: "Completed Projects", value: analytics.completedProjects, icon: <CheckCircle2 size={17} />, tone: "up" as const, color: "var(--green)" },
    { label: "Open Tasks", value: analytics.openTasks, icon: <ListTodo size={17} />, tone: "flat" as const, color: "var(--amber)" },
    { label: "Completed Tasks", value: analytics.completedTasks, icon: <CheckCircle2 size={17} />, tone: "up" as const, color: "var(--green)" },
    { label: "Total Clients", value: analytics.totalClients, icon: <Users size={17} />, tone: "flat" as const, color: "var(--purple)" },
    { label: "Team Members", value: analytics.totalTeamMembers, icon: <UserCog size={17} />, tone: "flat" as const, color: "var(--accent)" },
    { label: "Hours Logged", value: `${analytics.totalHoursLogged.toFixed(1)}h`, icon: <Clock size={17} />, tone: "up" as const, color: "var(--green)" },
  ];

  return (
    <div style={{ maxWidth: "1320px" }}>
      <PageHeader
        title="TriosFlow Analytics"
        subtitle="Business intelligence across revenue, profitability, team productivity and projects."
        icon={<TrendingUp size={22} />}
        actions={
          <Button variant="primary" onClick={refreshAnalytics} loading={loading}>
            {!loading && <RefreshCw size={16} />}
            Refresh analytics
          </Button>
        }
      />

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} deltaTone={card.tone} />
        ))}
      </div>

      <div style={{ height: 28 }} />

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)" }}>
        <RevenueChart daily={analytics.revenueTrendDaily} weekly={analytics.revenueTrendWeekly} monthly={analytics.revenueTrendMonthly} />
        <ProfitChart
          trend={analytics.profitTrendMonthly}
          expenseBreakdown={analytics.expenseBreakdown}
          completionRate={analytics.projectCompletionRate}
          forecast={analytics.forecast}
        />
      </div>

      <div style={{ height: 16 }} />

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
        <TopContributors contributors={analytics.teamProductivity} />
        <TimeAnalytics stats={analytics.timeAnalytics} />
      </div>

      <div style={{ height: 16 }} />

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
        <ClientAnalytics clients={analytics.clientRevenueDistribution} />
        <ProjectAnalytics projects={analytics.projectAnalytics} />
      </div>
    </div>
  );
}
