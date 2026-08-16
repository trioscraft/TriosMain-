export default async function QuotationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Minimal placeholder to keep Next.js build passing.
  // The quotations feature is not part of the current Wiki sprint.
  // When quotations UI/data fetching is implemented, replace this page.
  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        color: "var(--text-primary)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "12px",
        }}
      >
        Quotation Details
      </h1>
      <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
        Quotation id: <span style={{ color: "var(--accent)" }}>{id}</span>
      </p>

      <div
        style={{
          marginTop: "24px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          background: "var(--bg-surface)",
          color: "var(--text-tertiary)",
        }}
      >
        This page is a temporary placeholder to unblock builds.
      </div>
    </div>
  );
}

