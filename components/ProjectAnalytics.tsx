import type { ProjectAnalyticsPoint } from "@/lib/types/analytics";

export default function ProjectAnalytics({
  projects,
}: {
  projects: ProjectAnalyticsPoint[];
}) {
  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div className="section-label">Project Analytics</div>
          <h2 style={{ margin: "10px 0 0", fontSize: "22px" }}>Performance by project</h2>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Monitor budgets, expenses, profits and forecasted completion.
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "grid", gap: "14px" }}>
        {projects.slice(0, 6).map((project) => (
          <div key={project.projectId} className="card" style={{ padding: "18px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{project.name}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                  Status: {project.status} • Progress: {project.progress}%
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: "120px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: project.profit >= 0 ? "var(--green)" : "var(--red)" }}>
                  ₹{project.profit.toLocaleString("en-IN")}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "4px" }}>
                  Forecast: {project.expectedCompletion}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "16px" }}>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "4px" }}>Budget</div>
                <div style={{ fontWeight: 700 }}>₹{project.budget.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "4px" }}>Expenses</div>
                <div style={{ fontWeight: 700, color: "var(--red)" }}>₹{project.expenses.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "4px" }}>Logged hours</div>
                <div style={{ fontWeight: 700 }}>{project.hours.toFixed(1)}h</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
