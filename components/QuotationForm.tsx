"use client";

import { useState } from "react";
import type { Quotation, QuotationItem, QuotationStatus } from "@/lib/types/invoice";
import type { Client } from "@/lib/types/admin/client";
import type { Project } from "@/lib/types/project";

type QuotationItemFormData = {
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type QuotationFormProps = {
  clients: Client[];
  projects: Project[];
  initialData?: Quotation & { items?: QuotationItem[] };
  onSubmit: (values: {
    quotation: Omit<Quotation, "id" | "created_at" | "updated_at" | "created_by">;
    items: Omit<QuotationItem, "id" | "quotation_id" | "created_at">[];
  }) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
  mode?: "create" | "edit";
};

const emptyItem: QuotationItemFormData = {
  title: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
};

export default function QuotationForm({
  clients,
  projects,
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Save Quotation",
}: QuotationFormProps) {
  const [client_id, setClientId] = useState(initialData?.client_id || "");
  const [project_id, setProjectId] = useState(initialData?.project_id || "");
  const [quotation_number, setQuotationNumber] = useState(
    initialData?.quotation_number || ""
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [services, setServices] = useState(initialData?.services || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [status, setStatus] = useState<QuotationStatus>(
    initialData?.status || "draft"
  );

  const getInitialItems = (): QuotationItemFormData[] => {
    if (initialData?.items?.length) {
      return initialData.items.map((item) => ({
        title: item.title,
        description: item.description || "",
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));
    }
    return [{ ...emptyItem }];
  };

  const [items, setItems] = useState<QuotationItemFormData[]>(getInitialItems);

  // Initialize form from initialData
  const [isInitialized, setIsInitialized] = useState(!initialData);
  if (!isInitialized && initialData) {
    setClientId(initialData.client_id);
    setProjectId(initialData.project_id || "");
    setQuotationNumber(initialData.quotation_number);
    setTitle(initialData.title || "");
    setDescription(initialData.description || "");
    setServices(initialData.services || "");
    setNotes(initialData.notes || "");
    setTerms(initialData.terms || "");
    setStatus(initialData.status);
    if (initialData.items?.length) {
      setItems(
        initialData.items.map((item) => ({
          title: item.title,
          description: item.description || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        }))
      );
    }
    setIsInitialized(true);
  }

  // Filter projects by selected client
  const filteredProjects = client_id
    ? projects.filter((p) => p.client_id === client_id)
    : projects;

  // Calculate total
  const calculateTotal = (itemList: QuotationItemFormData[]) => {
    return itemList.reduce((sum, item) => sum + item.total, 0);
  };

  const totalAmount = calculateTotal(items);

  const updateItem = (index: number, field: keyof QuotationItemFormData, value: string | number) => {
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
    if (!client_id || !quotation_number.trim()) {
      alert("Client and Quotation Number are required.");
      return;
    }

    const validItems = items.filter((item) => item.title.trim());

    await onSubmit({
      quotation: {
        client_id,
        project_id: project_id || null,
        quotation_number: quotation_number.trim(),
        title: title.trim() || null,
        description: description.trim() || null,
        services: services.trim() || null,
        amount: totalAmount,
        notes: notes.trim() || null,
        terms: terms.trim() || null,
        status,
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
            Client details and quotation reference
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
            <label className="label">Quotation Number *</label>
            <input
              className="input"
              value={quotation_number}
              onChange={(e) => setQuotationNumber(e.target.value)}
              placeholder="QT-202501-001"
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
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as QuotationStatus)}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotation Details */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
            Quotation Details
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Title, description, and scope of work
          </p>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quotation for services"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the quotation"
              style={{ minHeight: "80px" }}
            />
          </div>

          <div>
            <label className="label">Services / Scope of Work</label>
            <textarea
              className="input"
              rows={4}
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="Detailed scope of work and services included"
              style={{ minHeight: "100px" }}
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
                  gridTemplateColumns: "1fr auto",
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

        {/* Total */}
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "var(--accent-dim)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-accent)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--accent)" }}>
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
            Additional information and terms & conditions
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
              placeholder="Internal notes or client-facing notes"
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
              placeholder="Payment terms, validity, etc."
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