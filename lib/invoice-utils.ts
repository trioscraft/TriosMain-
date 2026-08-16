import { supabase } from "@/lib/supabase";
import type {
  Invoice,
  InvoiceItem,
  Quotation,
  QuotationItem,
  InvoiceWithRelations,
  QuotationWithRelations,
  DashboardMetrics,
  InvoiceStatus,
} from "@/lib/types/invoice";
import { logActivity } from "@/lib/activity";

// ============================================
// GENERATE INVOICE/QUOTATION NUMBERS
// ============================================

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `INV-${year}${month}-${random}`;
}

export function generateQuotationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `QT-${year}${month}-${random}`;
}

// ============================================
// INVOICE CRUD OPERATIONS
// ============================================

export async function createInvoice(
  invoiceData: Omit<Invoice, "id" | "created_at" | "updated_at">,
  items: Omit<InvoiceItem, "id" | "invoice_id" | "created_at">[]
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Calculate totals from items
  const amount = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = invoiceData.tax_amount || 0;
  const discountAmount = invoiceData.discount_amount || 0;
  const totalAmount = amount + taxAmount - discountAmount;

  const invoicePayload = {
    ...invoiceData,
    amount,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    created_by: user.id,
  };

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert([invoicePayload])
    .select("*")
    .single();

  if (invoiceError || !invoice) {
    throw new Error(invoiceError?.message || "Failed to create invoice");
  }

  // Create invoice items
  const itemsWithInvoiceId = items.map((item, index) => ({
    ...item,
    invoice_id: invoice.id,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from("invoice_items")
    .insert(itemsWithInvoiceId);

  if (itemsError) {
    console.error("Failed to create invoice items:", itemsError);
  }

  // Log activity
  await logInvoiceActivity(user.id, "created", invoice);

  return invoice;
}

export async function updateInvoice(
  invoiceId: string,
  invoiceData: Partial<Invoice>,
  items?: Omit<InvoiceItem, "id" | "invoice_id" | "created_at">[]
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .update(invoiceData)
    .eq("id", invoiceId)
    .select("*")
    .single();

  if (error || !invoice) {
    throw new Error(error?.message || "Failed to update invoice");
  }

  // Update items if provided
  if (items) {
    // Delete existing items
    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);

    // Create new items
    const itemsWithInvoiceId = items.map((item, index) => ({
      ...item,
      invoice_id: invoiceId,
      sort_order: index,
    }));

    await supabase.from("invoice_items").insert(itemsWithInvoiceId);
  }

  // Log activity
  await logInvoiceActivity(user.id, "updated", invoice);

  return invoice;
}

export async function deleteInvoice(invoiceId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get invoice details for logging
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, client(company_name)")
    .eq("id", invoiceId)
    .single();

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId);

  if (error) {
    throw new Error(error.message);
  }

  await logActivity({
    userId: user.id,
    userName: user.email || "Unknown",
    action: `deleted invoice ${invoice?.invoice_number}`,
    clientId: invoice?.client_id,
    clientName: invoice?.client?.company_name,
    invoiceId,
  });
}

export async function getInvoice(id: string): Promise<InvoiceWithRelations | null> {
  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      client (
        id,
        company_name,
        contact_name,
        email,
        phone,
        address
      ),
      project (
        id,
        name,
        description
      )
    `)
    .eq("id", id)
    .single();

  if (!invoice) return null;

  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .order("sort_order", { ascending: true });

  return {
    ...invoice,
    items: items || [],
  };
}

export async function getAllInvoices(): Promise<InvoiceWithRelations[]> {
  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      client (
        id,
        company_name,
        contact_name
      ),
      project (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  const invoicesWithItems = await Promise.all(
    (invoices || []).map(async (invoice) => {
      const { data: items } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id)
        .order("sort_order", { ascending: true });

      return {
        ...invoice,
        items: items || [],
      };
    })
  );

  return invoicesWithItems;
}

export async function getInvoicesByClient(clientId: string): Promise<InvoiceWithRelations[]> {
  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      client (
        id,
        company_name,
        contact_name,
        email,
        phone
      ),
      project (
        id,
        name
      )
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  const invoicesWithItems = await Promise.all(
    (invoices || []).map(async (invoice) => {
      const { data: items } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id)
        .order("sort_order", { ascending: true });

      return {
        ...invoice,
        items: items || [],
      };
    })
  );

  return invoicesWithItems;
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const updates: Partial<Invoice> = { status };
  
  if (status === "paid") {
    updates.payment_date = new Date().toISOString().split("T")[0];
  } else if (status === "draft") {
    updates.payment_date = null;
  }

  return updateInvoice(invoiceId, updates);
}

// ============================================
// QUOTATION CRUD OPERATIONS
// ============================================

export async function createQuotation(
  quotationData: Omit<Quotation, "id" | "created_at" | "updated_at">,
  items: Omit<QuotationItem, "id" | "quotation_id" | "created_at">[]
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Calculate total from items
  const amount = items.reduce((sum, item) => sum + item.total, 0);

  const quotationPayload = {
    ...quotationData,
    amount,
    created_by: user.id,
  };

  const { data: quotation, error: quotationError } = await supabase
    .from("quotations")
    .insert([quotationPayload])
    .select("*")
    .single();

  if (quotationError || !quotation) {
    throw new Error(quotationError?.message || "Failed to create quotation");
  }

  // Create quotation items
  const itemsWithQuotationId = items.map((item, index) => ({
    ...item,
    quotation_id: quotation.id,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from("quotation_items")
    .insert(itemsWithQuotationId);

  if (itemsError) {
    console.error("Failed to create quotation items:", itemsError);
  }

  // Log activity
  await logQuotationActivity(user.id, "created", quotation);

  return quotation;
}

export async function updateQuotation(
  quotationId: string,
  quotationData: Partial<Quotation>,
  items?: Omit<QuotationItem, "id" | "quotation_id" | "created_at">[]
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: quotation, error } = await supabase
    .from("quotations")
    .update(quotationData)
    .eq("id", quotationId)
    .select("*")
    .single();

  if (error || !quotation) {
    throw new Error(error?.message || "Failed to update quotation");
  }

  // Update items if provided
  if (items) {
    // Delete existing items
    await supabase.from("quotation_items").delete().eq("quotation_id", quotationId);

    // Create new items
    const itemsWithQuotationId = items.map((item, index) => ({
      ...item,
      quotation_id: quotationId,
      sort_order: index,
    }));

    await supabase.from("quotation_items").insert(itemsWithQuotationId);
  }

  // Log activity
  await logQuotationActivity(user.id, "updated", quotation);

  return quotation;
}

export async function deleteQuotation(quotationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: quotation } = await supabase
    .from("quotations")
    .select("*, client(company_name)")
    .eq("id", quotationId)
    .single();

  const { error } = await supabase
    .from("quotations")
    .delete()
    .eq("id", quotationId);

  if (error) {
    throw new Error(error.message);
  }

  await logActivity({
    userId: user.id,
    userName: user.email || "Unknown",
    action: `deleted quotation ${quotation?.quotation_number}`,
    clientId: quotation?.client_id,
    clientName: quotation?.client?.company_name,
    quotationId,
  });
}

export async function getQuotation(id: string): Promise<QuotationWithRelations | null> {
  const { data: quotation } = await supabase
    .from("quotations")
    .select(`
      *,
      client (
        id,
        company_name,
        contact_name,
        email,
        phone,
        address
      ),
      project (
        id,
        name,
        description
      )
    `)
    .eq("id", id)
    .single();

  if (!quotation) return null;

  const { data: items } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", id)
    .order("sort_order", { ascending: true });

  return {
    ...quotation,
    items: items || [],
  };
}

export async function getAllQuotations(): Promise<QuotationWithRelations[]> {
  const { data: quotations } = await supabase
    .from("quotations")
    .select(`
      *,
      client (
        id,
        company_name,
        contact_name
      ),
      project (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  const quotationsWithItems = await Promise.all(
    (quotations || []).map(async (quotation) => {
      const { data: items } = await supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", quotation.id)
        .order("sort_order", { ascending: true });

      return {
        ...quotation,
        items: items || [],
      };
    })
  );

  return quotationsWithItems;
}

export async function getQuotationsByClient(clientId: string): Promise<QuotationWithRelations[]> {
  const { data: quotations } = await supabase
    .from("quotations")
    .select(`
      *,
      client (
        id,
        company_name,
        contact_name,
        email,
        phone
      ),
      project (
        id,
        name
      )
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  const quotationsWithItems = await Promise.all(
    (quotations || []).map(async (quotation) => {
      const { data: items } = await supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", quotation.id)
        .order("sort_order", { ascending: true });

      return {
        ...quotation,
        items: items || [],
      };
    })
  );

  return quotationsWithItems;
}

export async function updateQuotationStatus(
  quotationId: string,
  status: "draft" | "sent" | "approved" | "rejected"
) {
  return updateQuotation(quotationId, { status });
}

// ============================================
// CONVERT QUOTATION TO INVOICE
// ============================================

export async function convertQuotationToInvoice(quotationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get quotation with items
  const quotation = await getQuotation(quotationId);
  if (!quotation) throw new Error("Quotation not found");

  // Create invoice from quotation
  const invoiceData = {
    client_id: quotation.client_id,
    project_id: quotation.project_id,
    quotation_id: quotationId,
    invoice_number: generateInvoiceNumber(),
    title: quotation.title || `Invoice for ${quotation.quotation_number}`,
    amount: quotation.amount,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: quotation.amount,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    status: "draft" as InvoiceStatus,
    payment_date: null,
    notes: quotation.notes,
    terms: quotation.terms,
    created_by: user.id,
  };

  // Convert quotation items to invoice items
  const invoiceItems = (quotation.items || []).map(item => ({
    title: item.title,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
    sort_order: item.sort_order || 0,
  }));

  const invoice = await createInvoice(invoiceData, invoiceItems);

  // Update quotation status to approved
  await updateQuotation(quotationId, { status: "approved" });

  // Log activity
  await logActivity({
    userId: user.id,
    userName: user.email || "Unknown",
    action: `converted quotation ${quotation.quotation_number} to invoice ${invoice.invoice_number}`,
    clientId: quotation.client_id,
    quotationId,
    invoiceId: invoice.id,
  });

  return invoice;
}

// ============================================
// DASHBOARD METRICS
// ============================================

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { data: invoices } = await supabase
    .from("invoices")
    .select("status, total_amount, due_date");

  const { data: quotations } = await supabase
    .from("quotations")
    .select("status");

  const today = new Date().toISOString().split("T")[0];

  let outstandingInvoices = 0;
  let paidInvoices = 0;
  let totalRevenue = 0;
  let overdueAmount = 0;
  let totalInvoices = 0;
  let pendingQuotations = 0;
  const totalQuotations = quotations?.length || 0;

  for (const invoice of invoices || []) {
    totalInvoices++;

    if (invoice.status === "paid") {
      paidInvoices++;
      totalRevenue += Number(invoice.total_amount || 0);
    } else if (invoice.status === "sent" || invoice.status === "draft") {
      outstandingInvoices++;
      if (invoice.due_date && invoice.due_date < today) {
        overdueAmount += Number(invoice.total_amount || 0);
      }
    }

    if (invoice.status === "approved") {
      paidInvoices++;
      totalRevenue += Number(invoice.total_amount || 0);
    }
  }

  for (const quotation of quotations || []) {
    if (quotation.status === "draft" || quotation.status === "sent") {
      pendingQuotations++;
    }
  }

  return {
    outstandingInvoices,
    paidInvoices,
    totalRevenue,
    overdueAmount,
    totalInvoices,
    totalQuotations,
    pendingQuotations,
  };
}

// ============================================
// ACTIVITY LOGGING HELPERS
// ============================================

async function logInvoiceActivity(
  userId: string,
  action: string,
  invoice: Invoice & { client?: { company_name?: string } }
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  await logActivity({
    userId,
    userName: user?.email || "Unknown",
    action: `${action} invoice ${invoice.invoice_number}`,
    clientId: invoice.client_id,
    clientName: invoice.client?.company_name,
    invoiceId: invoice.id,
  });
}

async function logQuotationActivity(
  userId: string,
  action: string,
  quotation: Quotation & { client?: { company_name?: string } }
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  await logActivity({
    userId,
    userName: user?.email || "Unknown",
    action: `${action} quotation ${quotation.quotation_number}`,
    clientId: quotation.client_id,
    clientName: quotation.client?.company_name,
    quotationId: quotation.id,
  });
}

// ============================================
// FORMAT HELPERS
// ============================================

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    draft: "badge-amber",
    sent: "badge-blue",
    approved: "badge-green",
    rejected: "badge-red",
    paid: "badge-green",
    overdue: "badge-red",
    cancelled: "badge-red",
  };
  return statusMap[status] || "badge-blue";
}