import RoleGuard from "@/components/RoleGuard";
import { PageHeader } from "@/components/admin/ui/Card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "900px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Settings"
          subtitle="Admin settings and configuration."
          icon={<Settings size={22} />}
        />
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
          Settings are coming soon.
        </div>
      </div>
    </RoleGuard>
  );
}