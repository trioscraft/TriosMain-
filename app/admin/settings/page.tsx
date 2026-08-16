import RoleGuard from "@/components/RoleGuard";

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="text-white">
        <h1 className="text-4xl font-bold mb-6">Settings</h1>
        <p className="text-slate-400">
          Admin settings and configuration live here.
        </p>
      </div>
    </RoleGuard>
  );
}
