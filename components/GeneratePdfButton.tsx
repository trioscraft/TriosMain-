"use client";

import { generateInvoicePDF, generateQuotationPDF, downloadAsPDF } from "@/lib/pdf-generator";
import type { InvoiceWithRelations, QuotationWithRelations } from "@/lib/types/invoice";

type GeneratePdfButtonProps = {
  type: "invoice" | "quotation";
  data: InvoiceWithRelations | QuotationWithRelations;
  variant?: "button" | "icon";
};

export default function GeneratePdfButton({ type, data, variant = "button" }: GeneratePdfButtonProps) {
  const handleGenerate = () => {
    if (type === "invoice") {
      const html = generateInvoicePDF(data as InvoiceWithRelations);
      downloadAsPDF(html, `Invoice-${(data as InvoiceWithRelations).invoice_number}.pdf`);
    } else {
      const html = generateQuotationPDF(data as QuotationWithRelations);
      downloadAsPDF(html, `Quotation-${(data as QuotationWithRelations).quotation_number}.pdf`);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleGenerate}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: "18px",
          padding: "8px",
          borderRadius: "var(--radius-sm)",
          transition: "all var(--transition-fast)",
        }}
        title={`Download ${type} as PDF`}
        className="btn"
      >
        📄
      </button>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      className="btn"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        fontSize: "13px",
      }}
    >
      📄 Download PDF
    </button>
  );
}