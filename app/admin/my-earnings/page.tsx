import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";

export default async function MyEarningsPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email || "";
  const { data: profile } = await supabase
    .from("profiles")
    .select("hourly_rate")
    .eq("email", email)
    .single();

  const { data: entries } = await supabase
    .from("time_entries")
    .select("total_hours")
    .eq("user_id", user?.id || "");

  const totalHours =
    entries?.reduce(
      (sum, entry) => sum + Number(entry.total_hours || 0),
      0
    ) || 0;

  const hourlyRate = Number(profile?.hourly_rate || 0);
  const estimatedEarnings = totalHours * hourlyRate;

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div className="text-white">
        <h1 className="text-4xl font-bold mb-6">My Earnings</h1>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="text-slate-400 uppercase text-xs tracking-[0.18em] mb-3">
              Total hours
            </div>
            <div className="text-3xl font-bold">{totalHours.toFixed(2)}h</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="text-slate-400 uppercase text-xs tracking-[0.18em] mb-3">
              Estimated earnings
            </div>
            <div className="text-3xl font-bold">₹{estimatedEarnings.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
