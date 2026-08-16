import type { BreakdownPoint, ForecastData, TrendPoint } from "@/lib/types/analytics";

function bars(trend: TrendPoint[]) {
  const max = Math.max(...trend.map((point) => point.value), 1);
  return trend.map((point) => {
    const width = Math.round((point.value / max) * 100);
    return (
      <div key={point.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ width: "68px", fontSize: "13px", color: "var(--text-secondary)" }}>{point.label}</span>
        <div style={{ flex: 1, minWidth: 0, height: "10px", borderRadius: "999px", background: "rgba(104,211,145,0.12)" }}>
          <div style={{ width: `${width}%`, height: "100%", borderRadius: "999px", background: "var(--green)" }} />
        </div>
        <span style={{ width: "72px", textAlign: "right", fontSize: "13px", color: "var(--text-primary)" }}>
          ₹{point.value.toLocaleString("en-IN")}
        </span>
      </div>
    );
  });
}

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
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="section-label">Profit Intelligence</div>
          <h2 style={{ margin: "10px 0 0", fontSize: "22px" }}>Profit trend and expense mix</h2>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Forecast, completion rate, and expense distribution in a single view.
        </div>
      </div>

      <div style={{ display: "grid", gap: "20px", marginTop: "24px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>
            Monthly profit trend
          </div>
          <div style={{ display: "grid", gap: "10px" }}>{bars(trend)}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          <div className="card" style={{ padding: "18px", background: "rgba(104,211,145,0.08)", border: "1px solid rgba(104,211,145,0.18)" }}>
            <div className="section-label">Completion rate</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--green)", marginTop: "10px" }}>
              {completionRate}%
            </div>
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "100%", height: "8px", borderRadius: "999px", background: "var(--bg-elevated)" }}>
                <div style={{ width: `${completionRate}%`, height: "100%", background: "var(--green)", borderRadius: "999px" }} />
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>On target</span>
            </div>
          </div>

          <div className="card" style={{ padding: "18px", background: "rgba(99,179,237,0.08)", border: "1px solid rgba(99,179,237,0.18)" }}>
            <div className="section-label">Forecast</div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "10px" }}>Next completion</div>
            <div style={{ marginTop: "8px", color: "var(--text-primary)", fontSize: "16px" }}>{forecast.estimatedCompletion}</div>
            <div style={{ marginTop: "16px", fontSize: "14px", color: "var(--text-secondary)" }}>
              Expected profit: <strong>₹{forecast.expectedProfit.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>Expenses breakdown</div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{expenseBreakdown.length} categories</span>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {expenseBreakdown.map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "999px", background: item.color }} />
                  <span style={{ color: "var(--text-primary)", fontSize: "14px" }}>{item.label}</span>
                </div>
                <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>₹{item.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
