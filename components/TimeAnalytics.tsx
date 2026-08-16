import type { TimeAnalyticsData } from "@/lib/types/analytics";

export default function TimeAnalytics({ stats }: { stats: TimeAnalyticsData }) {
  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div className="section-label">Time Analytics</div>
          <h2 style={{ margin: "10px 0 0", fontSize: "22px" }}>Hours performance</h2>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Track time cadence by day, week, and month.
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
        {[
          { label: "Daily hours", value: stats.daily, accent: "var(--accent)" },
          { label: "Weekly hours", value: stats.weekly, accent: "var(--green)" },
          { label: "Monthly hours", value: stats.monthly, accent: "var(--purple)" },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "6px" }}>{item.label}</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: item.accent }}>{item.value.toFixed(1)}h</div>
            </div>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: item.accent, opacity: 0.12, display: "grid", placeItems: "center", color: item.accent }}>
              <span style={{ fontSize: "20px", fontWeight: 800 }}>{Math.min(9, Math.ceil(item.value / 10))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
