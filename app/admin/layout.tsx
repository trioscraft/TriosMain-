"use client";

import "./admin.css";
import Sidebar from "@/components/layout/Sidebar";
import NotificationBell from "@/components/NotificationBell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell" style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
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
            background: "rgba(244, 238, 227, 0.72)",
            backdropFilter: "blur(16px) saturate(140%)",
            WebkitBackdropFilter: "blur(16px) saturate(140%)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <NotificationBell />
        </div>
        <div style={{ padding: "22px 40px 40px" }}>{children}</div>
      </main>
    </div>
  );
}