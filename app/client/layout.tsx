import "../admin/admin.css";
import "./client.css";
import ClientNav from "@/components/ClientNav";
import RoleGuard from "@/components/RoleGuard";
import NotificationBell from "@/components/NotificationBell";
import RefreshIndicator from "@/components/RefreshIndicator";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <div className="admin-shell client-portal" style={{ minHeight: "100vh" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "24px",
            margin: "0 auto",
            maxWidth: "1280px",
            paddingTop: "18px",
            width: "100%",
          }}
        >
          <ClientNav />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "0 0 14px",
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "var(--bg-base)",
                backdropFilter: "blur(16px) saturate(140%)",
                WebkitBackdropFilter: "blur(16px) saturate(140%)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <NotificationBell />
            </div>
            {children}
          </div>
        </div>
      </div>
      <RefreshIndicator label="Client portal" variant="wave" />
    </RoleGuard>
  );
}