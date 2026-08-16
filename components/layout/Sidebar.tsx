import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "../LogoutButton";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/lib/getCurrentUserRole";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const adminNavigation: NavItem[] = [
  { href: "/admin", icon: "◆", label: "Dashboard" },
  { href: "/admin/calendar", icon: "◷", label: "Calendar" },
  { href: "/admin/clients", icon: "◎", label: "Clients" },
  { href: "/admin/projects", icon: "▣", label: "Projects" },
  { href: "/admin/team", icon: "◍", label: "Team" },
  { href: "/admin/earnings", icon: "▲", label: "Earnings" },
  { href: "/admin/notifications", icon: "●", label: "Notifications" },
  { href: "/admin/invoices", icon: "▤", label: "Invoices" },
  { href: "/admin/timer", icon: "◷", label: "Timer" },
  { href: "/admin/my-tasks", icon: "✓", label: "My Tasks" },
  { href: "/admin/settings", icon: "⚙", label: "Settings" },
];

const memberNavigation: NavItem[] = [
  { href: "/admin/calendar", icon: "◷", label: "Calendar" },
  { href: "/admin/notifications", icon: "●", label: "Notifications" },
  { href: "/admin/my-tasks", icon: "✓", label: "My Tasks" },
  { href: "/admin/timer", icon: "◷", label: "Timer" },
  { href: "/admin/my-earnings", icon: "▲", label: "My Earnings" },
  { href: "/admin/profile", icon: "◍", label: "Profile" },
];

const clientNavigation: NavItem[] = [
  { href: "/admin/client", icon: "◆", label: "Dashboard" },
  { href: "/admin/client/projects", icon: "▣", label: "Projects" },
  { href: "/admin/client/invoices", icon: "▤", label: "Invoices" },
  { href: "/admin/client/reports", icon: "▤", label: "Reports" },
  { href: "/admin/client/messages", icon: "◌", label: "Messages" },
];

const genericNavigation: NavItem[] = [
  { href: "/admin/timer", icon: "◷", label: "Timer" },
  { href: "/admin/my-tasks", icon: "✓", label: "My Tasks" },
];

export default function Sidebar() {
  const pathname = usePathname();
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
        padding: "28px 14px",
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
          marginBottom: "10px",
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
              background: "linear-gradient(135deg, var(--accent), #b8823c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              color: "#1a1206",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: "0 0 0 1px rgba(216,167,92,0.25), 0 6px 18px rgba(216,167,92,0.18)",
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
              }}
            >
              TriosFlow
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
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
        {navigation.map(({ href, icon, label }, i) => {
          const active = pathname === href;
          return (
            <Link
              key={`${href}-${i}`}
              href={href}
              className="nav-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px 9px 14px",
                borderRadius: "var(--radius-md)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? 600 : 450,
                position: "relative",
                background: active ? "rgba(216,167,92,0.08)" : "transparent",
                transition: "all var(--transition-fast)",
                animation: `fadeUp 0.4s ease both`,
                animationDelay: `${60 + i * 40}ms`,
              }}
            >
              {active && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "18%",
                    bottom: "18%",
                    width: "3px",
                    borderRadius: "0 4px 4px 0",
                    background: "var(--accent)",
                    boxShadow: "0 0 8px var(--accent-glow)",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "14px",
                  lineHeight: 1,
                  color: active ? "var(--accent)" : "var(--text-tertiary)",
                  width: "16px",
                  textAlign: "center",
                }}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
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
        }
      `}</style>
    </aside>
  );
}