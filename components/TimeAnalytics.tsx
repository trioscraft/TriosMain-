import { Clock } from "lucide-react";
import type { TimeAnalyticsData } from "@/lib/types/analytics";
import { ChartCard } from "@/components/admin/ui/Card";

export default function TimeAnalytics({ stats }: { stats: TimeAnalyticsData }) {
  const items = [
    { label: "Daily hours", value: stats.daily, accent: "var(--accent)", glow: "var(--accent-glow)" },
    { label: "Weekly hours", value: stats.weekly, accent: "var(--green)", glow: "var(--green-glow)" },
    { label: "Monthly hours", value: stats.monthly, accent: "var(--purple)", glow: "var(--purple-dim)" },
  ];

  return (
    <ChartCard
      icon={<Clock size={19} />}
      label="Time Analytics"
      title="Hours performance"
      description="Time cadence by day, week and month."
    >
      <div style={{ display: "grid", gap: 14 }}>
        {items.map((item) => (
          <div
            key={item.label}
            className="card"
            style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--glass-border)" }}
          >
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: 12.5, marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: item.accent, fontFamily: "var(--font-mono)" }}>{item.value.toFixed(1)}h</div>
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: item.accent,
                opacity: 0.14,
                display: "grid",
                placeItems: "center",
                color: item.accent,
                boxShadow: `0 0 22px -6px ${item.glow}`,
              }}
            >
              <Clock size={22} />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
