"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const clientNavigation = [
  { href: "/admin/client", icon: "🏠", label: "Dashboard" },
  { href: "/admin/client/projects", icon: "📁", label: "Projects" },
  { href: "/admin/client/invoices", icon: "🧾", label: "Invoices" },
  { href: "/admin/client/reports", icon: "📄", label: "Reports" },
  { href: "/admin/client/messages", icon: "💬", label: "Messages" },
];

export default function ClientNav() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        minWidth: "220px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "22px",
        padding: "24px 18px",
        position: "sticky",
        top: "24px",
        height: "fit-content",
      }}
    >
      <div style={{ marginBottom: "22px" }}>
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: "10px",
          }}
        >
          Client Portal
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Your Workspace
        </div>
      </div>

      <nav style={{ display: "grid", gap: "8px" }}>
        {clientNavigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "14px",
                textDecoration: "none",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                background: active ? "rgba(96, 165, 250, 0.12)" : "transparent",
                fontWeight: active ? 700 : 500,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
