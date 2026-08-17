import { PieChart, Target, TrendingUp } from "lucide-react";
import type { BreakdownPoint, ForecastData, TrendPoint } from "@/lib/types/analytics";
import { ChartCard, MetricBar } from "@/components/admin/ui/Card";

export default function ProfitChart({
  trend,
  expenseBreakdown,
  completionRate,
  forecast,
}: {
  trend: TrendPoint[];
  expenseBreakdown: BreakdownPoint[];
  completionRate: number;
  forecast: ForecastData;
}) {
  return (
    <ChartCard
      icon={<TrendingUp size={19} />}
      label="Profit Intelligence"
      title="Profit trend & expense mix"
      description="Forecast, completion rate and expense distribution."
    >
      <div style={{ display: "grid", gap: 22 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Monthly profit trend
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {trend.map((point) => (
              <MetricBar key={point.label} label={point.label} value={`₹${point.value.toLocaleString("en-IN")}`} width={(point.value / Math.max(...trend.map((p) => p.value), 1)) * 100} color="var(--green)" />
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="card" style={{ padding: 18, background: "var(--green-dim)", border: "1px solid rgba(78,125,94,0.22)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={15} style={{ color: "var(--green)" }} />
              <div className="section-label">Completion</div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "var(--green)", marginTop: 10 }}>{completionRate}%</div>
            <div style={{ marginTop: 14, height: 8, borderRadius: 999, background: "rgba(70, 55, 40, 0.08)" }}>
              <div style={{ width: `${completionRate}%`, height: "100%", background: "var(--green)", borderRadius: 999, boxShadow: "0 0 12px -2px var(--green-glow)" }} />
            </div>
          </div>

          <div className="card" style={{ padding: 18, background: "var(--info-dim)", border: "1px solid rgba(91,125,158,0.22)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={15} style={{ color: "var(--info)" }} />
              <div className="section-label">Forecast</div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>{forecast.estimatedCompletion}</div>
            <div style={{ marginTop: 12, fontSize: 13.5, color: "var(--text-secondary)" }}>
              Expected profit: <strong style={{ color: "var(--text-primary)" }}>₹{forecast.expectedProfit.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>Expenses breakdown</div>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{expenseBreakdown.length} categories</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {expenseBreakdown.map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 999, background: item.color, boxShadow: `0 0 10px -2px ${item.color}` }} />
                  <span style={{ color: "var(--text-primary)", fontSize: 14 }}>{item.label}</span>
                </div>
                <span style={{ color: "var(--text-secondary)", fontSize: 14, fontFamily: "var(--font-mono)" }}>₹{item.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
