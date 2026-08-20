import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { PageHeader, Card } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import Badge from "@/components/admin/ui/Badge";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Mail, ShieldCheck, Users, UserCog, Clock } from "lucide-react";

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  created_at: string | null;
};

export default async function TeamPage() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, name, role, created_at")
    .order("created_at", { ascending: true });

  const team = (profiles || []).filter(
    (p) => p.role === "admin" || p.role === "member"
  ) as Profile[];

  const admins = team.filter((p) => p.role === "admin").length;
  const members = team.filter((p) => p.role === "member").length;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "1060px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Team"
          subtitle="Everyone working across your projects, with their role and activity."
          icon={<Users size={22} />}
        />

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            marginBottom: 24,
          }}
        >
          <StatCard label="Team members" value={team.length} icon={<Users size={17} />} hint="admins + members" />
          <StatCard label="Admins" value={admins} icon={<ShieldCheck size={17} />} />
          <StatCard label="Members" value={members} icon={<UserCog size={17} />} />
        </div>

        {error ? (
          <div className="card" style={{ padding: 24, color: "var(--text-secondary)", fontSize: 14 }}>
            Could not load the team. {error.message}
          </div>
        ) : team.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
            No team members yet. Members will appear here once they sign up and get a role.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {team.map((member, i) => (
              <Card
                key={member.id}
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  animation: `fadeUp 0.4s ease both`,
                  animationDelay: `${i * 45}ms`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar name={member.name || member.email} size={48} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {member.name || "Unnamed member"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--text-secondary)",
                        fontSize: 13,
                        marginTop: 3,
                      }}
                    >
                      <Mail size={12} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.email || "no email"}
                      </span>
                    </div>
                  </div>
                  <Badge tone={member.role === "admin" ? "purple" : "blue"}>
                    {member.role === "admin" ? "Admin" : "Member"}
                  </Badge>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    color: "var(--text-tertiary)",
                    borderTop: "1px solid var(--border)",
                    paddingTop: 12,
                  }}
                >
                  <Clock size={13} />
                  Joined{" "}
                  {member.created_at
                    ? new Date(member.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
