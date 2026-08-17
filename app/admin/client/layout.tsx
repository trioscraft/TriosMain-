import "./client.css";
import ClientNav from "@/components/ClientNav";
import RoleGuard from "@/components/RoleGuard";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <div
        className="client-portal"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "24px",
          margin: "0 auto",
          maxWidth: "1280px",
          paddingTop: "18px",
        }}
      >
        <ClientNav />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </RoleGuard>
  );
}