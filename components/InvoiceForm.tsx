"use client";

import { useState } from "react";
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/lib/types/invoice";
import type { Client } from "@/lib/types/admin/client";
import type { Project } from "@/lib/types/project";

type InvoiceItemFormData = {
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type InvoiceFormProps = {
  clients: Client[];
  projects: Project[];
  initialData?: Invoice & { items?: InvoiceItem[] };
  onSubmit: (values: {
    invoice: Omit<Invoice, "id" | "created_at" | "updated_at" | "created_by">;
    items: Omit<InvoiceItem, "id" | "invoice_id" | "created_at">[];
  }) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
  mode?: "create" | "edit";
};

const emptyItem: InvoiceItemFormData = {
  title: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
};

export default function InvoiceForm({
  clients,
  projects,
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Save Invoice",
}: InvoiceFormProps) {
  const [client_id, setClientId] = useState(initialData?.client_id || "");
  const [project_id, setProjectId] = useState(initialData?.project_id || "");
  const [invoice_number, setInvoiceNumber] = useState(
    initialData?.invoice_number || ""
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [due_date, setDueDate] = useState(
    initialData?.due_date ? initialData.due_date.split("T")[0] : ""
  );
  const [tax_amount, setTaxAmount] = useState(initialData?.tax_amount || 0);
  const [discount_amount, setDiscountAmount] = useState(initialData?.discount_amount || 0);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [status, setStatus] = useState<InvoiceStatus>(
    initialData?.status || "draft"
  );

  const [items, setItems] = useState<InvoiceItemFormData[]>(
    initialData?.items?.length
      ? initialData.items.map((item) => ({
          title: item.title,
          description: item.description || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        }))
      : [{ ...emptyItem }]
  );

  // Filter projects by selected client
  const filteredProjects = client_id
    ? projects.filter((p) => p.client_id === client_id)
    : projects;

  // Calculate subtotals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal + tax_amount - discount_amount;

  const updateItem = (index: number, field: keyof InvoiceItemFormData, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total
    if (field === "quantity" || field === "unit_price") {
      const qty = field === "quantity" ? Number(value) : Number(newItems[index].quantity);
      const price = field === "unit_price" ? Number(value) : Number(newItems[index].unit_price);
      newItems[index].total = qty * price;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!client_id || !invoice_number.trim()) {
      alert("Client and Invoice Number are required.");
      return;
    }

    const validItems = items.filter((item) => item.title.trim());

    await onSubmit({
      invoice: {
        client_id,
        project_id: project_id || null,
        quotation_id: initialData?.quotation_id || null,
        invoice_number: invoice_number.trim(),
        title: title.trim() || null,
        amount: subtotal,
        tax_amount,
        discount_amount,
        total_amount: totalAmount,
        due_date: due_date || null,
        status,
        payment_date: initialData?.payment_date || null,
        notes: notes.trim() || null,
        terms: terms.trim() || null,
      },
      items: validItems.map((item) => ({
        title: item.title.trim(),
        description: item.description.trim() || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        sort_order: 0,
      })),
    });
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Basic Info */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
            Basic Information
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Client details and invoice reference
          </p>
        </div>

        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label className="label">Client *</label>
            <select
              className="input"
              value={client_id}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId("");
              }}
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Invoice Number *</label>
            <input
              className="input"
              value={invoice_number}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-202501-001"
            />
          </div>

          <div>
            <label className="label">Project</label>
            <select
              className="input"
              value={project_id}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={!client_id}
            >
              <option value="">Select Project</option>
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              className="input"
              type="date"
              value={due_date}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
            Invoice Details
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Title and additional information
          </p>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Invoice for services"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card" style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              Line Items
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Add products or services with pricing
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={addItem}
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            + Add Item
          </button>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, display: "grid", gap: "12px" }}>
                  <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "2fr 1fr" }}>
                    <div>
                      <label className="label">Title *</label>
                      <input
                        className="input"
                        value={item.title}
                        onChange={(e) => updateItem(index, "title", e.target.value)}
                        placeholder="Item title"
                      />
                    </div>
                    <div>
                      <label className="label">Unit Price (₹)</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, "unit_price", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div>
                      <label className="label">Quantity</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Total</label>
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "var(--bg-card)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--accent)",
                          fontWeight: 600,
                        }}
                      >
                        ₹{item.total.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Description (optional)</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Item description"
                      style={{ minHeight: "50px" }}
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--red)",
                      fontSize: "20px",
                      padding: "4px",
                      marginTop: "20px",
                    }}
                    title="Remove item"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
            Pricing
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Subtotal, tax, and discounts
          </p>
        </div>

        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label className="label">Subtotal</label>
            <div
              style={{
                padding: "10px 14px",
                background: "var(--bg-card)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontWeight: 600,
              }}
            >
              ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
            </div>
          </div>

          <div>
            <label className="label">Tax Amount (₹)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={tax_amount}
              onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="label">Discount Amount (₹)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={discount_amount}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            background: "var(--accent-dim)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-accent)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent)" }}>
            Total Amount
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
            Notes & Terms
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Additional information and payment terms
          </p>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment instructions or other notes"
              style={{ minHeight: "80px" }}
            />
          </div>

          <div>
            <label className="label">Terms & Conditions</label>
            <textarea
              className="input"
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Payment terms, late fees, etc."
              style={{ minHeight: "100px" }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        {onCancel && (
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ flex: 1 }}
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}