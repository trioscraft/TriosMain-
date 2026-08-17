import clsx from "clsx";
import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  delta,
  deltaTone,
  icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  icon?: ReactNode;
  hint?: string;
}) {
  const deltaColor =
    deltaTone === "up" ? "var(--green)" : deltaTone === "down" ? "var(--red)" : "var(--text-secondary)";

  return (
    <div className="stat-card animate-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="section-label">{label}</span>
        {icon && (
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--radius-sm)",
              display: "grid",
              placeItems: "center",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              color: "var(--accent)",
              fontSize: 16,
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="stat-value" style={{ marginTop: 12 }}>
        {value}
      </div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        {delta && (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: deltaColor }} className="num">
            {deltaTone === "up" ? "▲" : deltaTone === "down" ? "▼" : "●"} {delta}
          </span>
        )}
        {hint && <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{hint}</span>}
      </div>
    </div>
  );
}
