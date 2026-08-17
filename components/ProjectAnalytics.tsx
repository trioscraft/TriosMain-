import { FolderKanban } from "lucide-react";
import type { ProjectAnalyticsPoint } from "@/lib/types/analytics";
import { ChartCard } from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";

function statusTone(status: string) {
  if (status === "completed") return "green" as const;
  if (status === "active" || status === "in_progress") return "amber" as const;
  if (status === "on_hold" || status === "paused") return "red" as const;
  return "blue" as const;
}

export default function ProjectAnalytics({ projects }: { projects: ProjectAnalyticsPoint[] }) {
  return (
    <ChartCard
      icon={<FolderKanban size={19} />}
      label="Project Analytics"
      title="Performance by project"
      description="Budgets, expenses, profit and forecasted completion."
    >
      <div style={{ display: "grid", gap: 12 }}>
        {projects.slice(0, 6).map((project) => (
          <div key={project.projectId} className="card" style={{ padding: 18, border: "1px solid var(--glass-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>{project.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <Badge tone={statusTone(project.status)} dot>
                    {project.status.replace("_", " ")}
                  </Badge>
                  <span style={{ color: "var(--text-tertiary)", fontSize: 12.5 }}>{project.progress}% complete</span>
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: 120 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: project.profit >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-mono)" }}>
                  ₹{project.profit.toLocaleString("en-IN")}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>Forecast: {project.expectedCompletion}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 11.5, marginBottom: 4 }}>Budget</div>
                <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>₹{project.budget.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 11.5, marginBottom: 4 }}>Expenses</div>
                <div style={{ fontWeight: 700, color: "var(--red)", fontFamily: "var(--font-mono)" }}>₹{project.expenses.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 11.5, marginBottom: 4 }}>Hours</div>
                <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{project.hours.toFixed(1)}h</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
