import RoleGuard from "@/components/RoleGuard";
import KanbanBoard from "@/components/admin/kanban/KanbanBoard";

export default async function MemberKanbanPage() {
  return (
    <RoleGuard allowedRoles={["member"]}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 18 }}>
          Kanban Board
        </h1>
        <KanbanBoard />
      </div>
    </RoleGuard>
  );
}