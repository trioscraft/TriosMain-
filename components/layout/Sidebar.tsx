"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderKanban,
  Users2,
  TrendingUp,
  Bell,
  ReceiptText,
  Timer,
  ListTodo,
  Settings,
  BarChart3,
  MessageSquare,
  CircleUser,
  type LucideIcon,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/lib/getCurrentUserRole";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  match?: (path: string) => boolean;
};

const iconFor = (Icon: LucideIcon, active: boolean, size = 18) => (
  <Icon size={size} strokeWidth={2} style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }} />
);

const adminNavigation: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", match: (p) => p === "/admin" },
  { href: "/admin/calendar", icon: Calendar, label: "Calendar" },
  { href: "/admin/clients", icon: Users, label: "Clients" },
  { href: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { href: "/admin/team", icon: Users2, label: "Team" },
  { href: "/admin/earnings", icon: TrendingUp, label: "Earnings" },
  { href: "/admin/notifications", icon: Bell, label: "Notifications" },
  { href: "/admin/invoices", icon: ReceiptText, label: "Invoices" },
  { href: "/admin/timer", icon: Timer, label: "Timer" },
  { href: "/admin/my-tasks", icon: ListTodo, label: "My Tasks" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

const memberNavigation: NavItem[] = [
  { href: "/admin/calendar", icon: Calendar, label: "Calendar" },
  { href: "/admin/notifications", icon: Bell, label: "Notifications" },
  { href: "/admin/my-tasks", icon: ListTodo, label: "My Tasks" },
  { href: "/admin/timer", icon: Timer, label: "Timer" },
  { href: "/admin/my-earnings", icon: TrendingUp, label: "My Earnings" },
  { href: "/admin/profile", icon: CircleUser, label: "Profile" },
];

const clientNavigation: NavItem[] = [
  { href: "/admin/client", icon: LayoutDashboard, label: "Dashboard", match: (p) => p === "/admin/client" },
  { href: "/admin/client/projects", icon: FolderKanban, label: "Projects" },
  { href: "/admin/client/invoices", icon: ReceiptText, label: "Invoices" },
  { href: "/admin/client/reports", icon: BarChart3, label: "Reports" },
  { href: "/admin/client/messages", icon: MessageSquare, label: "Messages" },
];

const genericNavigation: NavItem[] = [
  { href: "/admin/timer", icon: Timer, label: "Timer" },
  { href: "/admin/my-tasks", icon: ListTodo, label: "My Tasks" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole | null>(null);
  const [profileName, setProfileName] = useState("Team Member");
  const [profileTitle, setProfileTitle] = useState("Member");

  useEffect(() => {
    void (async () => {
      const roleMod = await import("@/lib/getCurrentUserRole");
      const role = await roleMod.getCurrentUserRole();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) setProfileName(user.email);

      if (role === "admin") {
        setProfileTitle("Administrator");
        setRole("admin");
      } else if (role === "member") {
        setProfileTitle("Member");
        setRole("member");
      } else if (role === "client") {
        setProfileTitle("Client");
        setRole("client");
      }
    })();
  }, []);

  const navigation =
    role === "admin"
      ? adminNavigation
      : role === "member"
      ? memberNavigation
      : role === "client"
      ? clientNavigation
      : genericNavigation;

  return (
    <aside
      className="glass"
      style={{
        width: "248px",
        minHeight: "100vh",
        margin: "14px 0 14px 14px",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--glass-border)",
        padding: "22px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        position: "sticky",
        top: 14,
        height: "calc(100vh - 28px)",
        animation: "slideInLeft 0.45s ease both",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "6px 12px 20px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent-bright), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              color: "#fff7ee",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: "0 0 0 1px rgba(194,91,47,0.3), 0 8px 22px -6px var(--accent-glow)",
            }}
          >
            TF
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "17px",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.1,
              }}
            >
              TriosFlow
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
              Workflow OS
            </div>
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "3px", overflowY: "auto", flex: 1 }}>
        {navigation.map(({ href, icon, label, match }, i) => {
          const active = match ? match(pathname) : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={`${href}-${i}`}
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
              {iconFor(icon, active)}
              {label}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    width: "6px",
                    height: "6px",
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

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          style={{
            padding: "11px 12px",
            background: "var(--glass-bg)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--accent)",
              flexShrink: 0,
            }}
          >
            {profileName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profileName}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{profileTitle}</div>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
