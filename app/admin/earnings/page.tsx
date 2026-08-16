import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";

export default async function EarningsPage() {
  const { data: projects, error: projectsError } =
    await supabase
      .from("projects")
      .select("*");

  const { data: profiles, error: profilesError } =
    await supabase
      .from("profiles")
      .select("*");

  const { data: entries, error: entriesError } =
    await supabase
      .from("time_entries")
      .select("*");

  const { data: expenses, error: expensesError } =
    await supabase
      .from("expenses")
      .select("project_id, amount");

  console.log("Projects:", projects);
  console.log("Projects Error:", projectsError);

  console.log("Profiles:", profiles);
  console.log("Profiles Error:", profilesError);

  console.log("Entries:", entries);
  console.log("Entries Error:", entriesError);

  console.log("Expenses:", expenses);
  console.log("Expenses Error:", expensesError);

  // Calculate totals for dashboard metrics
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
      <div className="text-white">
        <h1 className="text-4xl font-bold mb-8">
          Earnings Dashboard 💰
        </h1>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-amber-400">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Total Expenses</div>
            <div className="text-3xl font-bold text-red-400">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Total Profit</div>
            <div className={`text-3xl font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              ₹{totalProfit.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {projects?.map((project) => {
          const projectExpenses =
            expenses?.filter((e) => e.project_id === project.id) || [];

          const projectTotalExpenses =
            projectExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

          const projectProfit = Number(project.budget || 0) - projectTotalExpenses;

          const projectEntries =
            entries?.filter(
              (entry) =>
                entry.project_id === project.id
            ) || [];

          const totalHours =
            projectEntries.reduce(
              (sum, entry) =>
                sum + Number(entry.total_hours || 0),
              0
            );

          return (
            <div
              key={project.id}
              className="bg-slate-900 p-6 rounded-xl mb-8 border border-slate-700"
            >
              <h2 className="text-2xl font-bold">
                {project.name}
              </h2>

              {/* Project Financial Summary */}
              <div className="grid grid-cols-3 gap-4 mt-4 mb-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-slate-400 text-xs mb-1">Budget</div>
                  <div className="text-lg font-bold text-amber-400">
                    ₹{Number(project.budget).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-slate-400 text-xs mb-1">Expenses</div>
                  <div className="text-lg font-bold text-red-400">
                    ₹{projectTotalExpenses.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-slate-400 text-xs mb-1">Profit</div>
                  <div className={`text-lg font-bold ${projectProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ₹{projectProfit.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <p className="text-slate-400 text-sm">
                Member earnings are calculated based on profit (₹{projectProfit.toLocaleString("en-IN")}), not the full budget.
              </p>

              <div className="mt-6 space-y-4">
                {profiles?.map((profile) => {
                  const memberHours =
                    projectEntries
                      .filter(
                        (entry) =>
                          entry.member_id ===
                          profile.id
                      )
                      .reduce(
                        (sum, entry) =>
                          sum +
                          Number(
                            entry.total_hours || 0
                          ),
                        0
                      );

                  // Use profit instead of budget for share calculation
                  const share =
                    totalHours > 0
                      ? (
                          (memberHours /
                            totalHours) *
                          projectProfit
                        ).toFixed(0)
                      : 0;

                  return (
                    <div
                      key={profile.id}
                      className="border border-slate-700 rounded-lg p-4"
                    >
                      <h3 className="font-bold text-lg">
                        {profile.name}
                      </h3>

                      <p className="text-slate-400">
                        Hours Worked:{" "}
                        {memberHours.toFixed(2)}
                      </p>

                      <p className="text-green-400">
                        Profit Share: ₹{Number(share).toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-green-400">
                Total Hours:{" "}
                {totalHours.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </RoleGuard>
  );
}