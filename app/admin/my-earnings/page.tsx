import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function formatINR(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default async function MyEarningsPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email || "";
  const userId = user?.id || "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, hourly_rate")
    .eq("email", email)
    .single();

  const { data: entries } = await supabase
    .from("time_entries")
    .select("total_hours, project_id")
    .eq("user_id", userId);

  const hourlyRate = Number(profile?.hourly_rate || 0);
  const totalHours =
    entries?.reduce((sum, entry) => sum + Number(entry.total_hours || 0), 0) || 0;
  const estimatedEarnings = totalHours * hourlyRate;

  // Per-project breakdown
  const projectIds = Array.from(
    new Set((entries || []).map((e) => e.project_id).filter(Boolean))
  ) as string[];

  let projectMap = new Map<string, string>();
  if (projectIds.length) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", projectIds);
    (projects || []).forEach((p) => projectMap.set(p.id, p.name || "Unknown"));
  }

  const projectRows = Array.from(
    projectMap.keys().reduce((map, pid) => {
      const hours = (entries || [])
        .filter((e) => e.project_id === pid)
        .reduce((sum, e) => sum + Number(e.total_hours || 0), 0);
      map.set(pid, { name: projectMap.get(pid) || "Unknown", hours });
      return map;
    }, new Map<string, { name: string; hours: number }>())
  )
    .map(([pid, v]) => ({ id: pid, ...v, earnings: v.hours * hourlyRate }))
    .sort((a, b) => b.hours - a.hours);

  const statCards = [
    {
      label: "Total hours logged",
      value: `${totalHours.toFixed(2)}h`,
      tone: "var(--accent-bright)",
    },
    {
      label: "Estimated earnings",
      value: formatINR(estimatedEarnings),
      tone: "var(--green)",
    },
    {
      label: "Hourly rate",
      value: hourlyRate ? formatINR(hourlyRate) : "—",
      tone: "var(--info)",
    },
    {
      label: "Active projects",
      value: String(projectRows.length),
      tone: "var(--purple)",
    },
  ];

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div style={{ maxWidth: 960, margin: "0 auto", animation: "fadeUp 0.5s ease both" }}>
        {/* Header */}
        <div style={{ marginBottom: 26 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Finance</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            My Earnings
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
            Track the time you&apos;ve logged and what it&apos;s worth.
          </p>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {statCards.map((s, i) => (
            <div
              key={s.label}
              className="stat-card"
              style={{ animation: `fadeUp 0.45s ease both`, animationDelay: `${i * 60}ms` }}
            >
              <div className="m-metric-label">{s.label}</div>
              <div className="m-metric" style={{ color: s.tone, fontSize: 26 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Per-project breakdown */}
        <div
          className="card"
          style={{ padding: "22px 24px", marginBottom: 22 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div className="m-section">Time by project</div>
            {hourlyRate > 0 && (
              <span className="m-chip">
                {formatINR(hourlyRate)} / hr
              </span>
            )}
          </div>

          {projectRows.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "12px 0" }}>
              No time entries yet. Use the timer to start logging hours.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {projectRows.map((row, i) => {
                const pct =
                  totalHours > 0 ? Math.min(100, (row.hours / totalHours) * 100) : 0;
                return (
                  <div key={row.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 7,
                        gap: 12,
                      }}
                    >
                      <Link
                        href={`/admin/projects/${row.id}`}
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          textDecoration: "none",
                        }}
                      >
                        {row.name}
                      </Link>
                      <div style={{ display: "flex", gap: 14, fontSize: 13 }}>
                        <span className="num" style={{ color: "var(--text-secondary)" }}>
                          {row.hours.toFixed(1)}h
                        </span>
                        {hourlyRate > 0 && (
                          <span className="num" style={{ color: "var(--green)", fontWeight: 600 }}>
                            {formatINR(row.earnings)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 50}ms` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="card" style={{ padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Tip</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Earnings are estimated from your hourly rate and logged time entries.
              Make sure you stop the timer each day so hours are counted accurately.
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}