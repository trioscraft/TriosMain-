import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, FileText, FolderKanban, IndianRupee, TrendingUp } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { Card } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import Badge from "@/components/admin/ui/Badge";
import { Avatar } from "@/components/admin/ui/Avatar";

function statusTone(status: string) {
  if (status === "completed") return "green" as const;
  if (status === "active" || status === "in_progress") return "blue" as const;
  if (status === "on_hold" || status === "paused") return "amber" as const;
  return "blue" as const;
}

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description, budget, progress, status")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const projectList = projects || [];
  const totalProjects = projectList.length;
  const totalRevenue = projectList.reduce((sum, project) => sum + Number(project.budget || 0), 0);
  const projectIds = projectList.map((project) => project.id);

  const { data: expenses } = projectIds.length
    ? await supabase.from("expenses").select("amount").in("project_id", projectIds)
    : { data: [] };

  const totalExpenses = (expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;

  if (!client) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16 }}>
        <div className="empty-state-icon">🔍</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-secondary)" }}>Client not found.</div>
        <Link href="/admin/clients" className="btn">
          <ArrowLeft size={14} /> Back to clients
        </Link>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "960px", animation: "fadeUp 0.5s ease both" }}>
        <Link
          href="/admin/clients"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", textDecoration: "none", fontSize: 13, marginBottom: 22 }}
        >
          <ArrowLeft size={14} /> Clients
        </Link>

        <Card style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 16 }}>
              <Avatar name={client.company_name} size={56} />
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>{client.company_name}</h1>
                <p style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: 15 }}>{client.contact_name || "No contact assigned"}</p>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12, fontSize: 13.5, color: "var(--text-secondary)" }}>
                  {client.email && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Mail size={14} style={{ color: "var(--text-tertiary)" }} /> {client.email}
                    </span>
                  )}
                  {client.phone && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Phone size={14} style={{ color: "var(--text-tertiary)" }} /> {client.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge tone={client.status === "active" ? "green" : "red"} dot>
              {client.status}
            </Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Address</div>
              <div style={{ fontSize: 15, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <MapPin size={15} style={{ color: "var(--text-tertiary)", marginTop: 2 }} /> {client.address || "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Notes</div>
              <div style={{ fontSize: 15, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <FileText size={15} style={{ color: "var(--text-tertiary)", marginTop: 2 }} /> {client.notes || "No notes added."}
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="Projects" value={totalProjects} icon={<FolderKanban size={17} />} deltaTone="flat" />
          <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={<IndianRupee size={17} />} deltaTone="up" />
          <StatCard label="Expenses" value={`₹${totalExpenses.toLocaleString("en-IN")}`} icon={<TrendingUp size={17} />} deltaTone="down" />
          <StatCard label="Profit" value={`₹${totalProfit.toLocaleString("en-IN")}`} icon={<IndianRupee size={17} />} deltaTone={totalProfit >= 0 ? "up" : "down"} />
        </div>

        <Card style={{ padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Projects for this client</h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: 13, marginTop: 6 }}>Review projects connected to this client.</p>
          </div>

          {projectList.length === 0 ? (
            <div className="empty-state">No projects are linked to this client yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {projectList.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="card card-interactive"
                  style={{ textDecoration: "none", color: "inherit", padding: 18, display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{project.name}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{project.description || "No description"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 8, fontSize: 13, color: "var(--text-tertiary)" }}>Budget ₹{Number(project.budget || 0).toLocaleString("en-IN")}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                      <Badge tone={statusTone(project.status)} dot>
                        {project.status}
                      </Badge>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{project.progress}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </RoleGuard>
  );
}
