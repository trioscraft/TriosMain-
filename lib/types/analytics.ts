export type TrendPoint = {
  label: string;
  value: number;
};

export type BreakdownPoint = {
  label: string;
  value: number;
  color: string;
};

export type ContributorAnalytics = {
  id: string;
  name: string;
  hours: number;
  tasksCompleted: number;
  revenue: number;
};

export type ClientAnalyticsPoint = {
  clientId: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  projects: number;
  invoices: number;
};

export type ProjectAnalyticsPoint = {
  projectId: string;
  name: string;
  budget: number;
  expenses: number;
  profit: number;
  progress: number;
  hours: number;
  status: string;
  expectedCompletion: string;
};

export type TimeAnalyticsData = {
  daily: number;
  weekly: number;
  monthly: number;
};

export type ProfileMinimal = {
  id: string;
  name: string | null;
};

export type ExpenseMinimal = {
  id: string;
  project_id: string;
  amount: number;
  category: string | null;
};

export type TimeEntryMinimal = {
  id: string;
  project_id: string;
  member_id: string;
  total_hours: number;
  created_at?: string;
  createdAt?: string;
  date?: string;
};

export type TaskMinimal = {
  id: string;
  assigned_to: string | null;
  status: string;
};

export type ProjectAnalyticsInput = {
  id: string;
  name: string;
  budget: number;
  progress: number;
  status: string;
  start_date: string | null;
  deadline: string | null;
};

export type ForecastData = {
  estimatedCompletion: string;
  expectedProfit: number;
  projectCompletionRate: number;
};

export type AnalyticsData = {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  activeProjects: number;
  completedProjects: number;
  openTasks: number;
  completedTasks: number;
  totalClients: number;
  totalTeamMembers: number;
  totalHoursLogged: number;
  revenueTrendDaily: TrendPoint[];
  revenueTrendWeekly: TrendPoint[];
  revenueTrendMonthly: TrendPoint[];
  profitTrendMonthly: TrendPoint[];
  expenseBreakdown: BreakdownPoint[];
  projectCompletionRate: number;
  teamProductivity: ContributorAnalytics[];
  clientRevenueDistribution: ClientAnalyticsPoint[];
  projectAnalytics: ProjectAnalyticsPoint[];
  timeAnalytics: TimeAnalyticsData;
  forecast: ForecastData;
};