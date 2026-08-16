import RoleGuard from "@/components/RoleGuard";

export default function TeamPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-4xl font-bold">
        Team
      </h1>

      <p className="mt-4">
        Rahul
      </p>
    </main>
    </RoleGuard>
  );
}