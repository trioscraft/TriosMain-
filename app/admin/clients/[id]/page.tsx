import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";

export default async function ClientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

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
    ? await supabase
        .from("expenses")
        .select("amount")
        .in("project_id", projectIds)
    : { data: [] };

  const totalExpenses = (expenses || []).reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const totalProfit = totalRevenue - totalExpenses;

  if (!client) {
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
        Client not found.
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "900px", animation: "fadeUp 0.5s ease both" }}>
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
            href="/admin/clients"
            style={{
              color: "var(--text-tertiary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            Clients
          </Link>
          <span>›</span>
          <span style={{ color: "var(--text-secondary)" }}>{client.company_name}</span>
        </div>

        <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "28px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                }}
              >
                {client.company_name}
              </h1>
              <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "15px" }}>
                {client.contact_name || "No contact assigned"}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "14px",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              {client.status}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "14px",
              marginTop: "24px",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Contact Email
              </div>
              <div style={{ fontSize: "15px", color: "var(--text-primary)" }}>{client.email || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Phone
              </div>
              <div style={{ fontSize: "15px", color: "var(--text-primary)" }}>{client.phone || "—"}</div>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Address
              </div>
              <div style={{ fontSize: "15px", color: "var(--text-primary)" }}>{client.address || "—"}</div>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Notes
              </div>
              <div style={{ fontSize: "15px", color: "var(--text-primary)" }}>{client.notes || "No notes added."}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Projects
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--accent)" }}>
              {totalProjects}
            </div>
          </div>
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Revenue
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--green)" }}>
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Expenses
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--red)" }}>
              ₹{totalExpenses.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Profit
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: totalProfit >= 0 ? "var(--green)" : "var(--red)" }}>
              ₹{totalProfit.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Projects for this client
              </h2>
              <p style={{ color: "var(--text-tertiary)", fontSize: "13px", marginTop: "6px" }}>
                Review projects connected to this client and open details.
              </p>
            </div>
          </div>

          {projectList.length === 0 ? (
            <div
              style={{
                padding: "42px",
                textAlign: "center",
                color: "var(--text-tertiary)",
              }}
            >
              No projects are linked to this client yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {projectList.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="card"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    padding: "18px 20px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "14px",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "15px",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      {project.name}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {project.description || "No description"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: "8px", fontSize: "13px", color: "var(--text-tertiary)" }}>
                      Budget ₹{Number(project.budget || 0).toLocaleString("en-IN")}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-end" }}>
                      <span className={`badge ${project.status === "completed" ? "badge-green" : project.status === "active" ? "badge-blue" : "badge-amber"}`}>
                        {project.status}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
