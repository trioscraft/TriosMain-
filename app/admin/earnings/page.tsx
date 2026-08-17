import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { PageHeader, Card } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { IndianRupee, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Badge from "@/components/admin/ui/Badge";

function formatINR(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default async function EarningsPage() {
  const { data: projects, error: projectsError } =
    await supabase.from("projects").select("*");

  const { data: profiles, error: profilesError } =
    await supabase.from("profiles").select("*");

  const { data: entries, error: entriesError } =
    await supabase.from("time_entries").select("*");

  const { data: expenses, error: expensesError } =
    await supabase.from("expenses").select("project_id, amount");

  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalProfit = 0;

  if (projects) {
    totalRevenue = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
  }

  if (expenses) {
    totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }

  totalProfit = totalRevenue - totalExpenses;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "1060px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Earnings"
          subtitle="Revenue, expenses and profit-share across all projects."
          icon={<TrendingUp size={22} />}
        />

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 24 }}>
          <StatCard label="Total Revenue" value={formatINR(totalRevenue)} icon={<IndianRupee size={17} />} deltaTone="up" />
          <StatCard label="Total Expenses" value={formatINR(totalExpenses)} icon={<Wallet size={17} />} deltaTone="down" />
          <StatCard label="Total Profit" value={formatINR(totalProfit)} icon={<TrendingUp size={17} />} deltaTone={totalProfit >= 0 ? "up" : "down"} />
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {projects?.map((project) => {
            const projectExpenses =
              expenses?.filter((e) => e.project_id === project.id) || [];

            const projectTotalExpenses =
              projectExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

            const projectProfit = Number(project.budget || 0) - projectTotalExpenses;

            const projectEntries =
              entries?.filter((entry) => entry.project_id === project.id) || [];

            const totalHours =
              projectEntries.reduce((sum, entry) => sum + Number(entry.total_hours || 0), 0);

            return (
              <Card key={project.id} style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>{project.name}</h2>
                  <Badge tone={projectProfit >= 0 ? "green" : "red"} dot>
                    {projectProfit >= 0 ? "Profitable" : "Loss"}
                  </Badge>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 18 }}>
                  <StatCard label="Budget" value={formatINR(Number(project.budget || 0))} deltaTone="flat" />
                  <StatCard label="Expenses" value={formatINR(projectTotalExpenses)} deltaTone="down" />
                  <StatCard label="Profit" value={formatINR(projectProfit)} deltaTone={projectProfit >= 0 ? "up" : "down"} />
                  <StatCard label="Hours" value={`${totalHours.toFixed(1)}h`} deltaTone="flat" />
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
                  Member earnings are calculated based on profit ({formatINR(projectProfit)}), not the full budget.
                </p>

                <div style={{ display: "grid", gap: 10 }}>
                  {profiles?.map((profile) => {
                    const memberHours =
                      projectEntries
                        .filter((entry) => entry.user_id === profile.id)
                        .reduce((sum, entry) => sum + Number(entry.total_hours || 0), 0);

                    const share =
                      totalHours > 0
                        ? ((memberHours / totalHours) * projectProfit).toFixed(0)
                        : 0;

                    return (
                      <div key={profile.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.name}</div>
                          <div style={{ color: "var(--text-tertiary)", fontSize: 12.5, marginTop: 2 }}>
                            Hours worked: {memberHours.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="num" style={{ fontWeight: 700, color: projectProfit >= 0 ? "var(--green)" : "var(--red)", fontSize: 14 }}>
                            {formatINR(Number(share))}
                          </div>
                          <div style={{ color: "var(--text-tertiary)", fontSize: 11.5, marginTop: 2 }}>Profit share</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 18, fontSize: 13, color: "var(--text-tertiary)" }}>
                  Total hours: <strong className="num" style={{ color: "var(--text-primary)" }}>{totalHours.toFixed(2)}</strong>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </RoleGuard>
  );
}