import clsx from "clsx";
import { ReactNode } from "react";

export function ChartCard({
  icon,
  label,
  title,
  description,
  children,
  style,
  className,
}: {
  icon?: ReactNode;
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={clsx("card", className)} style={{ padding: 24, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {icon && (
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "var(--radius-md)",
                display: "grid",
                placeItems: "center",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                color: "var(--accent)",
                fontSize: 19,
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <div className="section-label">{label}</div>
            <h2 style={{ margin: "8px 0 0", fontSize: 20, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{title}</h2>
          </div>
        </div>
        {description && (
          <div style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 250, lineHeight: 1.5 }}>{description}</div>
        )}
      </div>
      <div style={{ marginTop: 22 }}>{children}</div>
    </div>
  );
}

export function MetricBar({
  label,
  value,
  width,
  color = "var(--accent)",
}: {
  label: string;
  value: ReactNode;
  width: number;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 70, color: "var(--text-secondary)", fontSize: 13 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0, height: 10, borderRadius: 999, background: "rgba(70, 55, 40, 0.08)" }}>
        <div
          style={{
            width: `${Math.max(2, Math.min(100, width))}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, white))`,
            boxShadow: `0 0 12px -3px ${color}`,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      <span style={{ width: 76, textAlign: "right", color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

export function Card({
  children,
  className,
  interactive,
  glass,
  accent,
  ...props
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  glass?: boolean;
  accent?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "card",
        glass && "glass",
        interactive && "card-interactive",
        accent && "glass-accent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  icon,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {icon && (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "var(--radius-md)",
              display: "grid",
              placeItems: "center",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              color: "var(--accent)",
              fontSize: 20,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}
