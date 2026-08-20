"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ReceiptText,
  BarChart3,
  Bell,
  MessageSquare,
  LogOut,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const clientNavigation: Array<{ href: string; icon: LucideIcon; label: string; match?: (p: string) => boolean }> = [
  { href: "/client", icon: LayoutDashboard, label: "Dashboard", match: (p) => p === "/client" },
  { href: "/client/projects", icon: FolderKanban, label: "Projects" },
  { href: "/client/invoices", icon: ReceiptText, label: "Invoices" },
  { href: "/client/reports", icon: BarChart3, label: "Reports" },
  { href: "/client/notifications", icon: Bell, label: "Notifications" },
  { href: "/client/messages", icon: MessageSquare, label: "Messages" },
];

export default function ClientNav() {
  const pathname = usePathname();

  return (
    <aside
      className="glass"
      style={{
        width: 232,
        flexShrink: 0,
        position: "sticky",
        top: "18px",
        height: "fit-content",
        maxHeight: "calc(100vh - 36px)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        animation: "slideInLeft 0.45s ease both",
      }}
    >
      <div
        style={{
          padding: "6px 12px 18px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent-bright), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff7ee",
              flexShrink: 0,
              boxShadow: "0 0 0 1px rgba(194,91,47,0.3), 0 8px 22px -6px var(--accent-glow)",
            }}
          >
            <Sparkles size={18} strokeWidth={2.2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "16px",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.15,
              }}
            >
              Client Portal
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}
            >
              Your workspace
            </div>
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {clientNavigation.map(({ href, icon: Icon, label, match }, i) => {
          const active = match ? match(pathname) : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? 600 : 450,
                position: "relative",
                background: active ? "var(--accent-soft)" : "transparent",
                border: active ? "1px solid var(--border-accent)" : "1px solid transparent",
                boxShadow: active ? "0 0 22px -8px var(--accent-glow)" : "none",
                transition: "all var(--transition-fast)",
                animation: `fadeUp 0.4s ease both`,
                animationDelay: `${60 + i * 35}ms`,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--glass-bg)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon
                size={18}
                strokeWidth={2}
                style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }}
              />
              {label}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 8px var(--accent-glow)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
        <LogoutButton />
      </div>
    </aside>
  );
}