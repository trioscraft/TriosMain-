export type AppSettings = {
  id: number;
  company_name: string;
  business_email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  date_format: string;
  sender_name: string;
  sender_email: string;
  notify_new_client: boolean;
  notify_project_updates: boolean;
  notify_invoice_paid: boolean;
  notify_reviews: boolean;
  notify_mentions: boolean;
  maintenance_mode: boolean;
  maintenance_scope: "client" | "member" | "both";
  maintenance_type: "scheduled" | "emergency" | "updating";
  maintenance_message: string;
  maintenance_ends_at: string | null;
  maintenance_reopen_at: string | null;
  maintenance_started_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

export type MaintenanceHistory = {
  id: number;
  started_at: string;
  ended_at: string;
  scope: "client" | "member" | "both";
  type: "scheduled" | "emergency" | "updating";
  message: string | null;
  reopen_minutes: number | null;
  created_at?: string;
};

export const MAINTENANCE_SCOPE_OPTIONS = [
  { value: "client", label: "Client portal" },
  { value: "member", label: "Member workspace" },
  { value: "both", label: "Both portals" },
] as const;

export const MAINTENANCE_TYPE_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "emergency", label: "Emergency" },
  { value: "updating", label: "Updating" },
] as const;

export type SettingsInput = Partial<
  Omit<AppSettings, "id" | "updated_at" | "updated_by">
>;

export const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "AED", label: "AED (د.إ)" },
];

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (ET)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
  { value: "UTC", label: "UTC" },
];

export const DATE_FORMAT_OPTIONS = [
  { value: "DD MMM YYYY", label: "14 Aug 2026" },
  { value: "DD/MM/YYYY", label: "14/08/2026" },
  { value: "MM/DD/YYYY", label: "08/14/2026" },
  { value: "YYYY-MM-DD", label: "2026-08-14" },
];
