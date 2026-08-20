import "../admin/admin.css";
import "./client.css";
import ClientNav from "@/components/ClientNav";
import RoleGuard from "@/components/RoleGuard";
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
          <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        </div>
      </div>
      <RefreshIndicator label="Client portal" variant="wave" />
    </RoleGuard>
  );
}