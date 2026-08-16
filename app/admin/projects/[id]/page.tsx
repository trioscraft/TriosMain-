import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import AddTaskForm from "./AddTaskForm";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import ProjectHeaderActions from "@/components/ProjectHeaderActions";
import TaskCard from "@/components/TaskCard";

export default async function ProjectDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: project } = await supabase
    .from("projects")
    .select("*, clients(company_name)")
    .eq("id", id)
    .single();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, profiles(name)")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (!project) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-display)",
          fontSize: "18px",
        }}
      >
        Project not found
      </div>
    );
  }

  const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0;
  const totalTasks = tasks?.length || 0;

  // Calculate total expenses
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;
  const budget = Number(project.budget || 0);
  const profit = budget - totalExpenses;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "800px", animation: "fadeUp 0.5s ease both" }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          fontSize: "13px",
          color: "var(--text-tertiary)",
        }}
      >
        <Link
          href="/admin/projects"
          style={{
            color: "var(--text-tertiary)",
            textDecoration: "none",
            transition: "color var(--transition-fast)",
          }}
        >
          Projects
        </Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{project.name}</span>
      </div>

      {/* Project header */}
      <div
        className="card"
        style={{
          padding: "28px",
          marginBottom: "24px",
          animation: "fadeUp 0.45s 60ms ease both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "26px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                }}
              >
                {project.name}
              </h1>
              <span
                className={`badge ${
                  project.status === "completed"
                    ? "badge-green"
                    : project.status === "active"
                    ? "badge-blue"
                    : "badge-amber"
                }`}
              >
                {project.status}
              </span>
            </div>

            {project.description && (
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                {project.description}
              </p>
            )}

            {project.clients?.company_name && (
              <div
                style={{
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--text-tertiary)",
                  fontSize: "13px",
                }}
              >
                <span>Client:</span>
                <Link href={`/admin/clients/${project.client_id}`} style={{ color: "var(--accent)" }}>
                  {project.clients.company_name}
                </Link>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
            <ProjectHeaderActions
              project={{
                id: project.id,
                name: project.name,
                description: project.description || "",
                budget: project.budget ?? 0,
                status: project.status || "active",
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          {[
            { label: "Budget", value: `₹${budget.toLocaleString("en-IN")}`, color: "var(--amber)" },
            { label: "Expenses", value: `₹${totalExpenses.toLocaleString("en-IN")}`, color: "var(--red)" },
            { label: "Profit", value: `₹${profit.toLocaleString("en-IN")}`, color: profit >= 0 ? "var(--green)" : "var(--red)" },
            { label: "Progress", value: `${project.progress}%`, color: "var(--accent)" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: s.color,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: "12px",
              color: "var(--text-tertiary)",
            }}
          >
            <span>Overall progress</span>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{project.progress}%</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "var(--bg-elevated)",
              borderRadius: "99px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${project.progress}%`,
                background: `linear-gradient(90deg, var(--accent), var(--purple))`,
                borderRadius: "99px",
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <div style={{ animation: "fadeUp 0.45s 120ms ease both" }}>
        <AddTaskForm projectId={id} projectName={project.name} />
      </div>

      {/* Tasks */}
      <div style={{ marginTop: "24px", animation: "fadeUp 0.45s 180ms ease both" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Tasks
          </h2>
          <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            {completedTasks}/{totalTasks} completed
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {!tasks || tasks.length === 0 ? (
            <div
              className="card"
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-tertiary)",
                fontSize: "14px",
              }}
            >
              No tasks yet. Add one above to get started.
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={id}
                projectName={project.name}
              />
            ))
          )}
        </div>
      </div>

      {/* Expenses Section */}
      <div style={{ marginTop: "32px", animation: "fadeUp 0.45s 240ms ease both" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Expenses
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: "4px" }}>
              Track project costs and calculate real profitability.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              fontSize: "13px",
              color: "var(--text-tertiary)",
            }}
          >
            <span>
              Total: <span style={{ color: "var(--red)" }}>₹{totalExpenses.toLocaleString("en-IN")}</span>
            </span>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            className="card"
            style={{
              padding: "18px 20px",
              background: "var(--amber-dim)",
              border: "1px solid rgba(246,173,85,0.2)",
            }}
          >
            <div style={{ fontSize: "11px", color: "var(--amber)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Project Budget
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--amber)",
                letterSpacing: "-0.02em",
              }}
            >
              ₹{budget.toLocaleString("en-IN")}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "18px 20px",
              background: "var(--red-dim)",
              border: "1px solid rgba(252,129,129,0.2)",
            }}
          >
            <div style={{ fontSize: "11px", color: "var(--red)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Project Expenses
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--red)",
                letterSpacing: "-0.02em",
              }}
            >
              ₹{totalExpenses.toLocaleString("en-IN")}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "18px 20px",
              background: profit >= 0 ? "var(--green-dim)" : "var(--red-dim)",
              border: `1px solid ${profit >= 0 ? "rgba(104,211,145,0.2)" : "rgba(252,129,129,0.2)"}`,
            }}
          >
            <div style={{ fontSize: "11px", color: profit >= 0 ? "var(--green)" : "var(--red)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Project Profit
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 700,
                color: profit >= 0 ? "var(--green)" : "var(--red)",
                letterSpacing: "-0.02em",
              }}
            >
              ₹{profit.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <AddExpenseForm
          projectId={id}
          projectName={project.name}
          onSuccess={() => {
            // Reload page to refresh expenses
            // In a real app, you might use React Query or SWR for better state management
          }}
        />

        <div style={{ marginTop: "16px" }}>
          <ExpenseList
            expenses={expenses || []}
            projectId={id}
            projectName={project.name}
            onExpensesChange={() => {
              // Reload page to refresh expenses
            }}
          />
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}