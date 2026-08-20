import RoleGuard from "@/components/RoleGuard";
import KanbanBoard from "@/components/admin/kanban/KanbanBoard";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export default async function ProjectKanbanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: project } = await supabase
    .from("projects")
    .select("id,name")
    .eq("id", id)
    .single();

  if (!project) {
    return (
      <div style={{ padding: 20, color: "var(--text-tertiary)" }}>Project not found</div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "member"]}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 18 }}>
          {project.name} — Kanban
        </h1>
        <KanbanBoard projectId={id} />
      </div>
    </RoleGuard>
  );
}

