import { supabase } from "@/lib/supabase";
import type { AnalyticsData, BreakdownPoint, ClientAnalyticsPoint, ContributorAnalytics, ProjectAnalyticsPoint, TimeAnalyticsData, TrendPoint, ExpenseMinimal, ProfileMinimal, TimeEntryMinimal, TaskMinimal, ProjectAnalyticsInput } from "@/lib/types/analytics";
import type { Invoice } from "@/lib/types/invoice";

const ALLOWED_REVENUE_STATUSES = new Set(["paid", "sent", "overdue", "approved"]);

function safeDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatWeekKey(date: Date): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return formatDateKey(copy);
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function buildDailyTrend(invoices: Invoice[]): TrendPoint[] {
  const labels: string[] = [];
  const keys: string[] = [];
  const today = new Date();

  for (let index = 6; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - index);
    keys.push(formatDateKey(day));
    labels.push(formatDayLabel(day));
  }

  const revenueByDate = new Map<string, number>();

  invoices.forEach((invoice) => {
    if (!ALLOWED_REVENUE_STATUSES.has(invoice.status)) return;
    const date = safeDate(invoice.created_at);
    if (!date) return;
    const key = formatDateKey(date);
    revenueByDate.set(key, (revenueByDate.get(key) || 0) + Number(invoice.total_amount || 0));
  });

  return keys.map((key, index) => ({
    label: labels[index],
    value: Number(revenueByDate.get(key) || 0),
  }));
}

function buildWeeklyTrend(invoices: Invoice[]): TrendPoint[] {
  const today = new Date();
  const weekKeys: string[] = [];
  const labels: string[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const key = formatWeekKey(date);
    weekKeys.push(key);
    labels.push(formatWeekLabel(safeDate(key) || date));
  }

  const revenueByWeek = new Map<string, number>();

  invoices.forEach((invoice) => {
    if (!ALLOWED_REVENUE_STATUSES.has(invoice.status)) return;
    const date = safeDate(invoice.created_at);
    if (!date) return;
    const key = formatWeekKey(date);
    revenueByWeek.set(key, (revenueByWeek.get(key) || 0) + Number(invoice.total_amount || 0));
  });

  return weekKeys.map((key, index) => ({
    label: labels[index],
    value: Number(revenueByWeek.get(key) || 0),
  }));
}

function buildMonthlyTrend(invoices: Invoice[]): TrendPoint[] {
  const today = new Date();
  const monthKeys: string[] = [];
  const labels: string[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = formatMonthKey(date);
    monthKeys.push(key);
    labels.push(formatMonthLabel(date));
  }

  const revenueByMonth = new Map<string, number>();

  invoices.forEach((invoice) => {
    if (!ALLOWED_REVENUE_STATUSES.has(invoice.status)) return;
    const date = safeDate(invoice.created_at);
    if (!date) return;
    const key = formatMonthKey(date);
    revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + Number(invoice.total_amount || 0));
  });

  return monthKeys.map((key, index) => ({
    label: labels[index],
    value: Number(revenueByMonth.get(key) || 0),
  }));
}

type ProjectMinimal = { id: string; name: string | null };

function buildExpenseBreakdown(expenses: ExpenseMinimal[], projects: ProjectMinimal[]): BreakdownPoint[] {
  const categoryMap = new Map<string, number>();
  const projectMap = new Map<string, string>();
  projects.forEach((project: ProjectMinimal) => {
    if (project?.id && project?.name) {
      projectMap.set(project.id, project.name);
    }
  });

  expenses.forEach((expense: ExpenseMinimal) => {
    const category = (expense.category || projectMap.get(expense.project_id) || "Other").trim() || "Other";
    categoryMap.set(category, (categoryMap.get(category) || 0) + Number(expense.amount || 0));
  });

  const colors = ["var(--amber)", "var(--green)", "var(--purple)", "var(--accent)", "var(--red)", "var(--text-tertiary)"];

  return Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], index) => ({
      label,
      value,
      color: colors[index % colors.length],
    }));
}

type ClientForAnalytics = { id: string; company_name: string | null };
type ProjectForClientAnalytics = { id: string; client_id: string | null };

function buildClientAnalytics(clients: ClientForAnalytics[], invoices: Invoice[], projects: ProjectForClientAnalytics[], expenses: ExpenseMinimal[]): ClientAnalyticsPoint[] {
  const clientMap = new Map<string, ClientAnalyticsPoint>();
  const projectClient = new Map<string, string>();

  projects.forEach((project) => {
    if (project?.id && project?.client_id) {
      projectClient.set(project.id, project.client_id);
    }
  });

  const clientNames = new Map<string, string>();
  clients.forEach((client) => {
    clientNames.set(client.id, client.company_name || "Client");
    clientMap.set(client.id, {
      clientId: client.id,
      label: client.company_name || "Client",
      revenue: 0,
      expenses: 0,
      profit: 0,
      projects: 0,
      invoices: 0,
    });
  });

  projects.forEach((project) => {
    const clientId = project.client_id;
    if (!clientId) return;
    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        clientId,
        label: "Client",
        revenue: 0,
        expenses: 0,
        profit: 0,
        projects: 0,
        invoices: 0,
      });
    }
    const client = clientMap.get(clientId)!;
    client.projects += 1;
  });

  invoices.forEach((invoice) => {
    const clientId = invoice.client_id;
    if (!clientId) return;
    const client = clientMap.get(clientId) || {
      clientId,
      label: clientNames.get(clientId) || "Client",
      revenue: 0,
      expenses: 0,
      profit: 0,
      projects: 0,
      invoices: 0,
    };
    client.revenue += Number(invoice.total_amount || 0);
    client.invoices += 1;
    clientMap.set(clientId, client);
  });

  expenses.forEach((expense: ExpenseMinimal) => {
    const projectId = expense.project_id;
    if (!projectId) return;
    const clientId = projectClient.get(projectId);
    if (!clientId) return;
    const client = clientMap.get(clientId);
    if (!client) return;
    client.expenses += Number(expense.amount || 0);
  });

  clientMap.forEach((client) => {
    client.profit = client.revenue - client.expenses;
    client.label = client.label || "Client";
  });

  return Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
}

function buildProjectAnalytics(projects: ProjectAnalyticsInput[], expenses: ExpenseMinimal[], timeEntries: TimeEntryMinimal[]): ProjectAnalyticsPoint[] {
  const expenseMap = new Map<string, number>();
  const hoursMap = new Map<string, number>();

  expenses.forEach((expense: ExpenseMinimal) => {
    if (!expense.project_id) return;
    expenseMap.set(expense.project_id, (expenseMap.get(expense.project_id) || 0) + Number(expense.amount || 0));
  });

  timeEntries.forEach((entry: TimeEntryMinimal) => {
    if (!entry.project_id) return;
    hoursMap.set(entry.project_id, (hoursMap.get(entry.project_id) || 0) + Number(entry.total_hours || 0));
  });

  return projects
    .map((project: ProjectAnalyticsInput) => {
      const budget = Number(project.budget || 0);
      const expensesTotal = Number(expenseMap.get(project.id) || 0);
      const profit = budget - expensesTotal;
      const progress = Number(project.progress || 0);
      const hours = Number(hoursMap.get(project.id) || 0);
      let expectedCompletion = "TBD";
      const startDate = safeDate(project.start_date);
      if (startDate && progress > 0 && progress < 100) {
        const elapsedDays = Math.max(1, Math.round((Date.now() - startDate.getTime()) / 86400000));
        const remainingDays = Math.round((elapsedDays / progress) * (100 - progress));
        const completionDate = new Date(Date.now() + remainingDays * 86400000);
        expectedCompletion = completionDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      } else if (project.deadline) {
        const deadline = safeDate(project.deadline);
        if (deadline) {
          expectedCompletion = deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
      }

      return {
        projectId: project.id,
        name: project.name || "Untitled Project",
        budget,
        expenses: expensesTotal,
        profit,
        progress,
        hours,
        status: project.status || "unknown",
        expectedCompletion,
      };
    })
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 8);
}

function buildTeamProductivity(profiles: ProfileMinimal[], timeEntries: TimeEntryMinimal[], tasks: TaskMinimal[], projects: ProjectAnalyticsInput[]): ContributorAnalytics[] {
  const profileMap = new Map<string, ContributorAnalytics>();
  const projectHours = new Map<string, number>();

  timeEntries.forEach((entry) => {
    if (!entry.project_id) return;
    projectHours.set(entry.project_id, (projectHours.get(entry.project_id) || 0) + Number(entry.total_hours || 0));
  });

  profiles.forEach((profile) => {
    profileMap.set(profile.id, {
      id: profile.id,
      name: profile.name || "Unknown",

      hours: 0,
      tasksCompleted: 0,
      revenue: 0,
    });
  });

  timeEntries.forEach((entry) => {
    if (!entry.member_id) return;
    const profile = profileMap.get(entry.member_id);
    if (!profile) return;
    profile.hours += Number(entry.total_hours || 0);
    const projectBudget = Number(projects.find((project) => project.id === entry.project_id)?.budget || 0);
    const projectTotalHours = Number(projectHours.get(entry.project_id) || 0);
    profile.revenue += projectTotalHours ? (Number(entry.total_hours || 0) / projectTotalHours) * projectBudget : 0;
  });

  tasks.forEach((task) => {
    if (!task.assigned_to || task.status !== "completed") return;
    const profile = profileMap.get(task.assigned_to);
    if (!profile) return;
    profile.tasksCompleted += 1;
  });

  const sorted = Array.from(profileMap.values()).sort((a, b) => b.hours - a.hours);
  return sorted.slice(0, 6);
}

function buildTimeAnalytics(timeEntries: TimeEntryMinimal[]): TimeAnalyticsData {
  const today = new Date();
  const dailyThreshold = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weeklyThreshold = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthlyThreshold = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totals = {
    daily: 0,
    weekly: 0,
    monthly: 0,
  };

  timeEntries.forEach((entry) => {
    const date = safeDate(entry.created_at ?? entry.createdAt ?? entry.date);

    if (!date) return;
    const hours = Number(entry.total_hours || 0);
    if (date >= dailyThreshold) totals.daily += hours;
    if (date >= weeklyThreshold) totals.weekly += hours;
    if (date >= monthlyThreshold) totals.monthly += hours;
  });

  return {
    daily: totals.daily,
    weekly: totals.weekly,
    monthly: totals.monthly,
  };
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [projectsRes, tasksRes, clientsRes, profilesRes, entriesRes, expensesRes, invoicesRes] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("clients").select("*").order("company_name", { ascending: true }),
    supabase.from("profiles").select("*").order("name", { ascending: true }),
    supabase.from("time_entries").select("*").order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
  ]);

  const projects = projectsRes.data || [];
  const tasks = tasksRes.data || [];
  const clients = clientsRes.data || [];
  const profiles = profilesRes.data || [];
  const entries = entriesRes.data || [];
  const expenses = expensesRes.data || [];
  const invoices = invoicesRes.data || [];

  const totalRevenue = invoices.reduce((sum, invoice) => {
    if (!ALLOWED_REVENUE_STATUSES.has(invoice.status)) return sum;
    return sum + Number(invoice.total_amount || 0);
  }, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const activeProjects = projects.filter((project) => project.status !== "completed").length;
  const completedProjects = projects.filter((project) => project.status === "completed").length;
  const openTasks = tasks.filter((task) => task.status !== "completed").length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const totalClients = clients.length;
  const totalTeamMembers = profiles.length;
  const totalHoursLogged = entries.reduce((sum, entry) => sum + Number(entry.total_hours || 0), 0);

  const revenueTrendDaily = buildDailyTrend(invoices);
  const revenueTrendWeekly = buildWeeklyTrend(invoices);
  const revenueTrendMonthly = buildMonthlyTrend(invoices);

  const profitTrendMonthly = revenueTrendMonthly.map((point) => {
    const monthKey = point.label;
    const monthValue = point.value;
    const expenseMonthTotal = expenses.reduce((sum, expense) => {
      const expenseDate = safeDate(expense.created_at);
      if (!expenseDate) return sum;
      if (formatMonthKey(expenseDate) === monthKey) {
        return sum + Number(expense.amount || 0);
      }
      return sum;
    }, 0);
    return {
      label: point.label,
      value: monthValue - expenseMonthTotal,
    };
  });

  const expenseBreakdown = buildExpenseBreakdown(expenses, projects);
  const projectCompletionRate = projects.length ? Math.round((completedProjects / projects.length) * 100) : 0;
  const teamProductivity = buildTeamProductivity(profiles, entries, tasks, projects);
  const clientRevenueDistribution = buildClientAnalytics(clients, invoices, projects, expenses);
  const projectAnalytics = buildProjectAnalytics(projects, expenses, entries);
  const timeAnalytics = buildTimeAnalytics(entries);

  let estimatedCompletion = "TBD";
  const activeWithStart = projects.filter((project) => project.start_date && project.progress > 0 && project.progress < 100);
  if (activeWithStart.length) {
    const totalDaysRemaining = activeWithStart.reduce((sum, project) => {
      const startDate = safeDate(project.start_date);
      if (!startDate) return sum;
      const elapsedDays = Math.max(1, Math.round((Date.now() - startDate.getTime()) / 86400000));
      const remaining = Math.round((elapsedDays / project.progress) * (100 - project.progress));
      return sum + remaining;
    }, 0);
    const averageRemaining = Math.round(totalDaysRemaining / activeWithStart.length);
    const completionDate = new Date(Date.now() + averageRemaining * 86400000);
    estimatedCompletion = completionDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return {
    totalRevenue,
    totalExpenses,
    totalProfit,
    activeProjects,
    completedProjects,
    openTasks,
    completedTasks,
    totalClients,
    totalTeamMembers,
    totalHoursLogged,
    revenueTrendDaily,
    revenueTrendWeekly,
    revenueTrendMonthly,
    profitTrendMonthly,
    expenseBreakdown,
    projectCompletionRate,
    teamProductivity,
    clientRevenueDistribution,
    projectAnalytics,
    timeAnalytics,
    forecast: {
      estimatedCompletion,
      expectedProfit: totalProfit,
      projectCompletionRate,
    },
  };
}