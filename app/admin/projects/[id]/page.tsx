import Link from "next/link";
import { ArrowLeft, IndianRupee, TrendingUp, Wallet, Gauge, FolderKanban, Receipt } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import AddTaskForm from "./AddTaskForm";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import ProjectHeaderActions from "@/components/ProjectHeaderActions";
import TaskCard from "@/components/TaskCard";
import { Card, PageHeader } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import Badge from "@/components/admin/ui/Badge";

function statusTone(status: string): "green" | "blue" | "amber" {
  if (status === "completed") return "green";
  if (status === "active" || status === "in_progress") return "blue";
  return "amber";
}

export default async function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: project } = await supabase.from("projects").select("*, clients(company_name)").eq("id", id).single();

  const { data: tasks } = await supabase.from("tasks").select("*").eq("project_id", id).order("created_at", { ascending: false });

  const { data: expenses } = await supabase.from("expenses").select("*, profiles(name)").eq("project_id", id).order("created_at", { ascending: false });

  if (!project) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16 }}>
        <div className="empty-state-icon">🔍</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-secondary)" }}>Project not found</div>
        <Link href="/admin/projects" className="btn">
          <ArrowLeft size={14} /> Back to projects
        </Link>
      </div>
    );
  }

  const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0;
  const totalTasks = tasks?.length || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;
  const budget = Number(project.budget || 0);
  const profit = budget - totalExpenses;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "860px", animation: "fadeUp 0.5s ease both" }}>
        <Link href="/admin/projects" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", textDecoration: "none", fontSize: 13, marginBottom: 22 }}>
          <ArrowLeft size={14} /> Projects
        </Link>

        <Card style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>{project.name}</h1>
                <Badge tone={statusTone(project.status)} dot>
                  {project.status}
                </Badge>
              </div>
              {project.description && <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>{project.description}</p>}
              {project.clients?.company_name && (
                <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-tertiary)", fontSize: 13 }}>
                  <span>Client:</span>
                  <Link href={`/admin/clients/${project.client_id}`} style={{ color: "var(--accent)" }}>
                    {project.clients.company_name}
                  </Link>
                </div>
              )}
            </div>
            <ProjectHeaderActions
              project={{ id: project.id, name: project.name, description: project.description || "", budget: project.budget ?? 0, status: project.status || "active" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginTop: 24, paddingTop: 22, borderTop: "1px solid var(--border)" }}>
            <StatCard label="Budget" value={`₹${budget.toLocaleString("en-IN")}`} icon={<IndianRupee size={16} />} deltaTone="flat" />
            <StatCard label="Expenses" value={`₹${totalExpenses.toLocaleString("en-IN")}`} icon={<Wallet size={16} />} deltaTone="down" />
            <StatCard label="Profit" value={`₹${profit.toLocaleString("en-IN")}`} icon={<TrendingUp size={16} />} deltaTone={profit >= 0 ? "up" : "down"} />
            <StatCard label="Progress" value={`${project.progress}%`} icon={<Gauge size={16} />} deltaTone="flat" />
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
              <span>Overall progress</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{project.progress}%</span>
            </div>
            <div className="progress-track" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </Card>

        <div style={{ marginBottom: 24 }}>
          <AddTaskForm projectId={id} projectName={project.name} />
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FolderKanban size={18} style={{ color: "var(--accent)" }} />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Tasks</h2>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              {completedTasks}/{totalTasks} completed
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!tasks || tasks.length === 0 ? (
              <div className="empty-state">No tasks yet. Add one above to get started.</div>
            ) : (
              tasks.map((task) => <TaskCard key={task.id} task={task} projectId={id} projectName={project.name} />)
            )}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Receipt size={18} style={{ color: "var(--red)" }} />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Expenses</h2>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              Total: <span style={{ color: "var(--red)" }}>₹{totalExpenses.toLocaleString("en-IN")}</span>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 16 }}>
            <StatCard label="Budget" value={`₹${budget.toLocaleString("en-IN")}`} deltaTone="flat" />
            <StatCard label="Expenses" value={`₹${totalExpenses.toLocaleString("en-IN")}`} deltaTone="down" />
            <StatCard label="Profit" value={`₹${profit.toLocaleString("en-IN")}`} deltaTone={profit >= 0 ? "up" : "down"} />
          </div>

          <AddExpenseForm projectId={id} projectName={project.name} />

          <div style={{ marginTop: 16 }}>
            <ExpenseList expenses={expenses || []} projectId={id} projectName={project.name} />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
