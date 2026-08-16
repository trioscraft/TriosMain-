import type { ClientAnalyticsPoint } from "@/lib/types/analytics";

export default function ClientAnalytics({
  clients,
}: {
  clients: ClientAnalyticsPoint[];
}) {
  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div className="section-label">Client Analytics</div>
          <h2 style={{ margin: "10px 0 0", fontSize: "22px" }}>Revenue by client</h2>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Compare top clients by revenue, profit and invoice activity.
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "grid", gap: "14px" }}>
        {clients.slice(0, 6).map((client) => (
          <div
            key={client.clientId}
            className="card"
            style={{ padding: "18px", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{client.label}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                  Projects: {client.projects} • Invoices: {client.invoices}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)" }}>
                  ₹{client.revenue.toLocaleString("en-IN")}
                </div>
                <div style={{ color: client.profit >= 0 ? "var(--green)" : "var(--red)", fontSize: "13px", marginTop: "4px" }}>
                  Profit ₹{client.profit.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
