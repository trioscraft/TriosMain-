import { LineChart, Sparkles } from "lucide-react";
import type { TrendPoint } from "@/lib/types/analytics";
import { ChartCard, MetricBar } from "@/components/admin/ui/Card";

export default function RevenueChart({ daily, weekly, monthly }: { daily: TrendPoint[]; weekly: TrendPoint[]; monthly: TrendPoint[] }) {
  const monthMax = Math.max(...monthly.map((i) => i.value), 1);
  const weekMax = Math.max(...weekly.map((i) => i.value), 1);
  const dayMax = Math.max(...daily.map((i) => i.value), 1);

  return (
    <ChartCard
      icon={<LineChart size={19} />}
      label="Revenue Trend"
      title="Revenue momentum"
      description="Tracked across daily, weekly and monthly slices."
    >
      <div style={{ display: "grid", gap: 22 }}>
        {[
          { name: "Daily", data: daily, max: dayMax },
          { name: "Weekly", data: weekly, max: weekMax },
          { name: "Monthly", data: monthly, max: monthMax },
        ].map((group) => (
          <div key={group.name}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {group.name}
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {group.data.map((point) => (
                <MetricBar
                  key={point.label}
                  label={point.label}
                  value={`₹${point.value.toLocaleString("en-IN")}`}
                  width={(point.value / group.max) * 100}
                  color="var(--accent)"
                />
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-tertiary)", fontSize: 12.5 }}>
          <Sparkles size={13} style={{ color: "var(--accent)" }} />
          Figures reflect confirmed invoice payments.
        </div>
      </div>
    </ChartCard>
  );
}
