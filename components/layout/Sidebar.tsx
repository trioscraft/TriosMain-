
import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "../LogoutButton";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/lib/getCurrentUserRole";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const adminNavigation: NavItem[] = [
  { href: "/admin", icon: "??", label: "Dashboard" },
  { href: "/admin/calendar", icon: "??", label: "Calendar" },
  { href: "/admin/clients", icon: "??", label: "Clients" },
  { href: "/admin/projects", icon: "??", label: "Projects" },
  { href: "/admin/team", icon: "??", label: "Team" },
  { href: "/admin/earnings", icon: "??", label: "Earnings" },
  { href: "/admin/notifications", icon: "??", label: "Notifications" },
  { href: "/admin/calendar", icon: "??", label: "Calendar" },
  { href: "/admin/timer", icon: "?", label: "Timer" },
  { href: "/admin/my-tasks", icon: "?", label: "My Tasks" },
  { href: "/admin/settings", icon: "??", label: "Settings" },
];

const memberNavigation: NavItem[] = [
  { href: "/admin/calendar", icon: "??", label: "Calendar" },
  { href: "/admin/notifications", icon: "??", label: "Notifications" },
  { href: "/admin/my-tasks", icon: "?", label: "My Tasks" },
  { href: "/admin/timer", icon: "?", label: "Timer" },
  { href: "/admin/my-earnings", icon: "??", label: "My Earnings" },
  { href: "/admin/profile", icon: "??", label: "Profile" },
];

const clientNavigation: NavItem[] = [
  { href: "/admin/client", icon: "??", label: "Dashboard" },
  { href: "/admin/client/projects", icon: "??", label: "Projects" },
  { href: "/admin/client/invoices", icon: "??", label: "Invoices" },
  { href: "/admin/client/reports", icon: "??", label: "Reports" },
  { href: "/admin/client/messages", icon: "??", label: "Messages" },
];

const genericNavigation: NavItem[] = [
  { href: "/admin/timer", icon: "?", label: "Timer" },
  { href: "/admin/my-tasks", icon: "?", label: "My Tasks" },
];

export default function Sidebar() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [profileName, setProfileName] = useState("Team Member");
  const [profileTitle, setProfileTitle] = useState("Member");

  useEffect(() => {
    void (async () => {
      const role = await import("@/lib/getCurrentUserRole").then((mod) =>
        mod.getCurrentUserRole()
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setProfileName(user.email);
      }

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
      className="sidebar"
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        padding: "28px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "sticky",
        top: 0,
        height: "100vh",
        animation: "slideInLeft 0.4s ease both",
      }}
    >
      <div
        style={{
          padding: "4px 12px 24px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
              animation: "float 3s ease-in-out infinite",
            }}
          >
            ??
          </div>

          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "17px",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              TriosFlow
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
              }}
            >
              Workflow OS
            </div>
          </div>
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {navigation.map(({ href, icon, label }, i) => (
          <Link
            key={`${href}-${i}`}
            href={href}

            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 450,
              transition: "all var(--transition-fast)",
              animation: `fadeUp 0.4s ease both`,
              animationDelay: `${60 + i * 50}ms`,
            }}
            className="nav-link"
          >
            <span
              style={{
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              {icon}
            </span>
            {label}
          </Link>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeUp 0.4s 0.35s ease both",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--accent)",
              flexShrink: 0,
            }}
          >
            {profileName.charAt(0).toUpperCase()}
          </div>

          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {profileName}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
              }}
            >
              {profileTitle}
            </div>
          </div>
        </div>

        <LogoutButton />
      </div>

      <style>{`
        .nav-link:hover {
          background: var(--bg-card);
          color: var(--text-primary);
          border-radius: var(--radius-md);
        }
      `}</style>
    </aside>
  );
}
