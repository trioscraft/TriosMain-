import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";

export default async function ProfilePage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name,email,role,hourly_rate,created_at")
    .eq("email", user?.email || "")
    .single();

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div className="text-white">
        <h1 className="text-4xl font-bold mb-6">Profile</h1>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="text-slate-400 uppercase text-xs tracking-[0.18em] mb-3">
              Name
            </div>
            <div className="text-2xl font-semibold">{profile?.name || user?.email}</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="text-slate-400 uppercase text-xs tracking-[0.18em] mb-3">
              Role
            </div>
            <div className="text-2xl font-semibold">{profile?.role || "Member"}</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="text-slate-400 uppercase text-xs tracking-[0.18em] mb-3">
              Email
            </div>
            <div className="text-2xl font-semibold">{profile?.email || "-"}</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="text-slate-400 uppercase text-xs tracking-[0.18em] mb-3">
              Hourly rate
            </div>
            <div className="text-2xl font-semibold">₹{Number(profile?.hourly_rate || 0).toFixed(0)}</div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
