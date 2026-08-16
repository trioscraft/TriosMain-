import type { TrendPoint } from "@/lib/types/analytics";

function renderBar(point: TrendPoint, maxValue: number) {
  const width = maxValue > 0 ? Math.round((point.value / maxValue) * 100) : 0;
  return (
    <div key={point.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ width: "70px", color: "var(--text-secondary)", fontSize: "13px" }}>{point.label}</span>
      <div style={{ flex: 1, minWidth: 0, height: "10px", borderRadius: "999px", background: "var(--bg-elevated)" }}>
        <div style={{ width: `${width}%`, height: "100%", borderRadius: "999px", background: "var(--accent)" }} />
      </div>
      <span style={{ width: "70px", textAlign: "right", color: "var(--text-primary)", fontSize: "13px" }}>
        ₹{point.value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

export default function RevenueChart({
  daily,
  weekly,
  monthly,
}: {
  daily: TrendPoint[];
  weekly: TrendPoint[];
  monthly: TrendPoint[];
}) {
  const monthMax = Math.max(...monthly.map((item) => item.value), 1);
  const weekMax = Math.max(...weekly.map((item) => item.value), 1);
  const dayMax = Math.max(...daily.map((item) => item.value), 1);

  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div className="section-label">Revenue Trend</div>
          <h2 style={{ margin: "10px 0 0", fontSize: "22px" }}>Revenue momentum</h2>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Revenue is tracked across daily, weekly, and monthly slices.
        </div>
      </div>

      <div style={{ display: "grid", gap: "18px", marginTop: "24px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Daily</div>
          <div style={{ display: "grid", gap: "10px" }}>{daily.map((point) => renderBar(point, dayMax))}</div>
        </div>

        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Weekly</div>
          <div style={{ display: "grid", gap: "10px" }}>{weekly.map((point) => renderBar(point, weekMax))}</div>
        </div>

        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Monthly</div>
          <div style={{ display: "grid", gap: "10px" }}>{monthly.map((point) => renderBar(point, monthMax))}</div>
        </div>
      </div>
    </div>
  );
}
