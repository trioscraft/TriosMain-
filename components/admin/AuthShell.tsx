import { ReactNode } from "react";
import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  icon,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        overflow: "hidden",
        padding: "28px 20px",
      }}
    >
      {/* Ambient warm orbs */}
      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(194,91,47,0.10) 0%, transparent 70%)",
          top: "8%",
          left: "58%",
          transform: "translate(-50%,-50%)",
          animation: "orb1 16s ease-in-out infinite",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,125,158,0.09) 0%, transparent 70%)",
          bottom: "4%",
          left: "12%",
          animation: "orb2 20s ease-in-out infinite",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,134,43,0.08) 0%, transparent 70%)",
          top: "60%",
          right: "6%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        className="glass-strong"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--glass-border-hover)",
          boxShadow: "0 40px 100px rgba(70, 55, 40, 0.28), inset 0 1px 0 rgba(255,255,255,0.9)",
          padding: "44px 40px 36px",
          overflow: "hidden",
          animation: "scaleIn 0.5s cubic-bezier(0.34,1.4,0.64,1) both",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, var(--accent), var(--info), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
          }}
        />

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 54,
              height: 54,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent-bright), var(--accent))",
              border: "1px solid rgba(194,91,47,0.3)",
              marginBottom: 18,
              fontSize: 22,
              color: "#fff7ee",
              fontWeight: 700,
              boxShadow: "0 8px 24px -6px var(--accent-glow)",
              textDecoration: "none",
            }}
          >
            TF
          </Link>
          <div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 27,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              TriosFlow
            </span>
          </div>
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            Admin Console
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 23,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              textAlign: "center",
            }}
          >
            {icon} {title}
          </h1>
          {subtitle && (
            <p style={{ color: "var(--text-secondary)", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {footer && (
          <div style={{ marginTop: 24, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13.5 }}>{footer}</div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 1,
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
        Secure Workspace · {new Date().getFullYear()}
      </div>
    </div>
  );
}