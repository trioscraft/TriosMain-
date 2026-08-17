import { Building2 } from "lucide-react";
import type { ClientAnalyticsPoint } from "@/lib/types/analytics";
import { ChartCard } from "@/components/admin/ui/Card";

export default function ClientAnalytics({ clients }: { clients: ClientAnalyticsPoint[] }) {
  return (
    <ChartCard
      icon={<Building2 size={19} />}
      label="Client Analytics"
      title="Revenue by client"
      description="Top clients by revenue, profit and invoice activity."
    >
      <div style={{ display: "grid", gap: 12 }}>
        {clients.slice(0, 6).map((client) => (
          <div key={client.clientId} className="card" style={{ padding: 18, border: "1px solid var(--glass-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>{client.label}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12.5, marginTop: 4 }}>
                  Projects: {client.projects} • Invoices: {client.invoices}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>₹{client.revenue.toLocaleString("en-IN")}</div>
                <div style={{ color: client.profit >= 0 ? "var(--green)" : "var(--red)", fontSize: 13, marginTop: 4 }}>
                  Profit ₹{client.profit.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
