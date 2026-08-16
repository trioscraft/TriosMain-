"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import NotificationBell from "@/components/NotificationBell";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar =
    pathname === "/admin/login" ||
    pathname === "/admin/signup" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  return (
    <div className="admin-shell" style={{ display: "flex" }}>
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
              padding: "18px 40px 0",
              gap: "18px",
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "rgba(0, 0, 0, 0.88)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <NotificationBell />
          </div>
        )}
        <div style={{ padding: hideSidebar ? "36px 40px" : "18px 40px 40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
