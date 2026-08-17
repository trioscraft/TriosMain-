import RoleGuard from "@/components/RoleGuard";
import { PageHeader } from "@/components/admin/ui/Card";
import { Users } from "lucide-react";

export default function TeamPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "900px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Team"
          subtitle="Manage your team members and their roles."
          icon={<Users size={22} />}
        />
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
          Team management is coming soon.
        </div>
      </div>
    </RoleGuard>
  );
}