"use client";

import "./admin.css";
import "./member.css";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import NotificationBell from "@/components/NotificationBell";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const mod = await import("@/lib/getCurrentUserRole");
      const role = await mod.getCurrentUserRole();
      if (mounted) setIsMember(role === "member");
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const hideSidebar =
    pathname === "/admin/login" ||
    pathname === "/admin/signup" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname.startsWith("/admin/client");

  return (
    <div
      className={`admin-shell${isMember ? " member-shell" : ""}`}
      style={{ display: "flex" }}
    >
      {!hideSidebar && <Sidebar />}
      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {!hideSidebar && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "16px 40px",
              gap: "16px",
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: isMember ? "var(--topbar-bg)" : "rgba(244, 238, 227, 0.72)",
              backdropFilter: "blur(16px) saturate(140%)",
              WebkitBackdropFilter: "blur(16px) saturate(140%)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <NotificationBell />
          </div>
        )}
        <div style={{ padding: hideSidebar ? "36px 40px" : "22px 40px 40px" }}>{children}</div>
      </main>
    </div>
  );
}
