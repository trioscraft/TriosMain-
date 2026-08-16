export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type QuotationStatus = "draft" | "sent" | "approved" | "rejected";

export interface Invoice {
  id: string;
  client_id: string;
  project_id: string | null;
  quotation_id: string | null;
  invoice_number: string;
  title: string | null;
  amount: number;
  tax_amount: number | null;
  discount_amount: number | null;
  total_amount: number;
  due_date: string | null;
  status: InvoiceStatus;
  payment_date: string | null;
  notes: string | null;
  terms: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  title: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number | null;
  created_at: string;
}

export interface Quotation {
  id: string;
  client_id: string;
  project_id: string | null;
  quotation_number: string;
  title: string | null;
  description: string | null;
  services: string | null;
  amount: number;
  notes: string | null;
  terms: string | null;
  status: QuotationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  title: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number | null;
  created_at: string;
}

export interface InvoiceWithRelations extends Invoice {
  client?: {
    id: string;
    company_name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  project?: {
    id: string;
    name: string;
    description: string | null;
  };
  invoice_items?: InvoiceItem[];
  items?: InvoiceItem[];
}

export interface QuotationWithRelations extends Quotation {
  client?: {
    id: string;
    company_name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  project?: {
    id: string;
    name: string;
    description: string | null;
  };
  items?: QuotationItem[];
}

export type InvoiceFormValues = Omit<
  Invoice,
  "id" | "created_at" | "updated_at" | "created_by"
>;

export type QuotationFormValues = Omit<
  Quotation,
  "id" | "created_at" | "updated_at" | "created_by"
>;

export type InvoiceItemFormValues = Omit<InvoiceItem, "id" | "invoice_id" | "created_at">;
export type QuotationItemFormValues = Omit<QuotationItem, "id" | "quotation_id" | "created_at">;

export interface DashboardMetrics {
  outstandingInvoices: number;
  paidInvoices: number;
  totalRevenue: number;
  overdueAmount: number;
  totalInvoices: number;
  totalQuotations: number;
  pendingQuotations: number;
}