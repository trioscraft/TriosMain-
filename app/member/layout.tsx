"use client";

import "../admin/admin.css";
import "../admin/member.css";
import Sidebar from "@/components/layout/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import RefreshIndicator from "@/components/RefreshIndicator";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell member-shell" style={{ display: "flex" }}>
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
            background: "var(--topbar-bg)",
            backdropFilter: "blur(16px) saturate(140%)",
            WebkitBackdropFilter: "blur(16px) saturate(140%)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <NotificationBell />
        </div>
        <div style={{ padding: "22px 40px 40px" }}>{children}</div>
      </main>
      <RefreshIndicator label="Member workspace" variant="dots" />
    </div>
  );
}