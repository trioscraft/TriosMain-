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
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

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
              background: "rgba(244, 238, 227, 0.72)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border)",
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