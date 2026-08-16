import type { InvoiceWithRelations, QuotationWithRelations } from "@/lib/types/invoice";

// Simple PDF generation using HTML/CSS to PDF approach
// In production, you might use a library like @react-pdf/renderer or pdfmake

export function generateInvoicePDF(invoice: InvoiceWithRelations): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #63b3ed; }
    .company-info h1 { font-size: 28px; color: #63b3ed; margin-bottom: 8px; }
    .company-info p { font-size: 14px; color: #666; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 24px; color: #1a1a2e; margin-bottom: 8px; }
    .invoice-info p { font-size: 14px; color: #666; }
    .invoice-info .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-cancelled { background: #e5e7eb; color: #374151; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .address-box { width: 45%; }
    .address-box h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-bottom: 8px; }
    .address-box p { font-size: 14px; margin-bottom: 4px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { text-align: left; padding: 12px 16px; background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .items-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .items-table .amount { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 14px; }
    .total-row.grand-total { font-size: 18px; font-weight: 700; color: #63b3ed; border-top: 2px solid #63b3ed; margin-top: 8px; padding-top: 12px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; }
    .notes { margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; }
    .notes h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    .notes p { font-size: 13px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>TriosFlow</h1>
      <p>Workflow OS</p>
    </div>
    <div class="invoice-info">
      <h2>INVOICE</h2>
      <p><strong>${invoice.invoice_number}</strong></p>
      <p>Date: ${new Date(invoice.created_at).toLocaleDateString('en-IN')}</p>
      ${invoice.due_date ? `<p>Due: ${new Date(invoice.due_date).toLocaleDateString('en-IN')}</p>` : ''}
      <span class="status status-${invoice.status}">${invoice.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="addresses">
    <div class="address-box">
      <h3>Bill To</h3>
      <p><strong>${invoice.client?.company_name || 'Client'}</strong></p>
      ${invoice.client?.contact_name ? `<p>${invoice.client.contact_name}</p>` : ''}
      ${invoice.client?.email ? `<p>${invoice.client.email}</p>` : ''}
      ${invoice.client?.phone ? `<p>${invoice.client.phone}</p>` : ''}
      ${invoice.client?.address ? `<p>${invoice.client.address}</p>` : ''}
    </div>
    ${invoice.project ? `
    <div class="address-box">
      <h3>Project</h3>
      <p><strong>${invoice.project.name}</strong></p>
      ${invoice.project.description ? `<p>${invoice.project.description}</p>` : ''}
    </div>
    ` : ''}
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th style="width: 80px; text-align: right;">Qty</th>
        <th style="width: 100px; text-align: right;">Unit Price</th>
        <th style="width: 100px; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items?.map(item => `
        <tr>
          <td><strong>${item.title}</strong></td>
          <td>${item.description || '-'}</td>
          <td class="amount">${item.quantity}</td>
          <td class="amount">₹${item.unit_price.toLocaleString('en-IN')}</td>
          <td class="amount">₹${item.total.toLocaleString('en-IN')}</td>
        </tr>
      `).join('') || '<tr><td colspan="5">No items</td></tr>'}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>₹${invoice.amount.toLocaleString('en-IN')}</span>
    </div>
    ${invoice.tax_amount ? `
    <div class="total-row">
      <span>Tax</span>
      <span>₹${invoice.tax_amount.toLocaleString('en-IN')}</span>
    </div>
    ` : ''}
    ${invoice.discount_amount ? `
    <div class="total-row">
      <span>Discount</span>
      <span>-₹${invoice.discount_amount.toLocaleString('en-IN')}</span>
    </div>
    ` : ''}
    <div class="total-row grand-total">
      <span>Total</span>
      <span>₹${invoice.total_amount.toLocaleString('en-IN')}</span>
    </div>
  </div>

  ${invoice.notes || invoice.terms ? `
  <div class="notes">
    ${invoice.notes ? `<h4>Notes</h4><p>${invoice.notes}</p>` : ''}
    ${invoice.terms ? `<h4>Terms & Conditions</h4><p>${invoice.terms}</p>` : ''}
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business! | Generated by TriosFlow</p>
  </div>
</body>
</html>
  `;

  return html;
}

export function generateQuotationPDF(quotation: QuotationWithRelations): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quotation ${quotation.quotation_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #63b3ed; }
    .company-info h1 { font-size: 28px; color: #63b3ed; margin-bottom: 8px; }
    .company-info p { font-size: 14px; color: #666; }
    .quote-info { text-align: right; }
    .quote-info h2 { font-size: 24px; color: #1a1a2e; margin-bottom: 8px; }
    .quote-info p { font-size: 14px; color: #666; }
    .quote-info .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .address-box { width: 45%; }
    .address-box h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-bottom: 8px; }
    .address-box p { font-size: 14px; margin-bottom: 4px; }
    .scope { margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .scope h3 { font-size: 14px; color: #64748b; margin-bottom: 12px; }
    .scope p { font-size: 14px; white-space: pre-wrap; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { text-align: left; padding: 12px 16px; background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .items-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .items-table .amount { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 14px; }
    .total-row.grand-total { font-size: 18px; font-weight: 700; color: #63b3ed; border-top: 2px solid #63b3ed; margin-top: 8px; padding-top: 12px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; }
    .notes { margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; }
    .notes h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    .notes p { font-size: 13px; white-space: pre-wrap; }
    .validity { margin-top: 20px; padding: 16px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #92400e; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>TriosFlow</h1>
      <p>Workflow OS</p>
    </div>
    <div class="quote-info">
      <h2>QUOTATION</h2>
      <p><strong>${quotation.quotation_number}</strong></p>
      <p>Date: ${new Date(quotation.created_at).toLocaleDateString('en-IN')}</p>
      <span class="status status-${quotation.status}">${quotation.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="addresses">
    <div class="address-box">
      <h3>Prepared For</h3>
      <p><strong>${quotation.client?.company_name || 'Client'}</strong></p>
      ${quotation.client?.contact_name ? `<p>${quotation.client.contact_name}</p>` : ''}
      ${quotation.client?.email ? `<p>${quotation.client.email}</p>` : ''}
      ${quotation.client?.phone ? `<p>${quotation.client.phone}</p>` : ''}
      ${quotation.client?.address ? `<p>${quotation.client.address}</p>` : ''}
    </div>
    ${quotation.project ? `
    <div class="address-box">
      <h3>Project</h3>
      <p><strong>${quotation.project.name}</strong></p>
      ${quotation.project.description ? `<p>${quotation.project.description}</p>` : ''}
    </div>
    ` : ''}
  </div>

  ${quotation.title || quotation.description ? `
  <div class="scope">
    <h3>${quotation.title || 'Quotation Details'}</h3>
    <p>${quotation.description || ''}</p>
  </div>
  ` : ''}

  ${quotation.services ? `
  <div class="scope">
    <h3>Scope of Work</h3>
    <p>${quotation.services}</p>
  </div>
  ` : ''}

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th style="width: 80px; text-align: right;">Qty</th>
        <th style="width: 100px; text-align: right;">Unit Price</th>
        <th style="width: 100px; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${quotation.items?.map(item => `
        <tr>
          <td><strong>${item.title}</strong></td>
          <td>${item.description || '-'}</td>
          <td class="amount">${item.quantity}</td>
          <td class="amount">₹${item.unit_price.toLocaleString('en-IN')}</td>
          <td class="amount">₹${item.total.toLocaleString('en-IN')}</td>
        </tr>
      `).join('') || '<tr><td colspan="5">No items</td></tr>'}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row grand-total">
      <span>Total Quoted Amount</span>
      <span>₹${quotation.amount.toLocaleString('en-IN')}</span>
    </div>
  </div>

  ${quotation.notes || quotation.terms ? `
  <div class="notes">
    ${quotation.notes ? `<h4>Notes</h4><p>${quotation.notes}</p>` : ''}
    ${quotation.terms ? `<h4>Terms & Conditions</h4><p>${quotation.terms}</p>` : ''}
  </div>
  ` : ''}

  <div class="validity">
    <strong>This quotation is valid for 30 days from the date of issue.</strong>
  </div>

  <div class="footer">
    <p>Thank you for considering our services! | Generated by TriosFlow</p>
  </div>
</body>
</html>
  `;

  return html;
}

// Function to open PDF in new window for printing/saving
export function openPDFInNewWindow(html: string, filename: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.title = filename;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

// Function to download as PDF (using print dialog)
export function downloadAsPDF(html: string, filename: string) {
  openPDFInNewWindow(html, filename);
}