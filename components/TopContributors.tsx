import type { ContributorAnalytics } from "@/lib/types/analytics";

export default function TopContributors({
  contributors,
}: {
  contributors: ContributorAnalytics[];
}) {
  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div className="section-label">Top Contributors</div>
          <h2 style={{ margin: "10px 0 0", fontSize: "22px" }}>Team performance leaders</h2>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Track hours, completed tasks, and revenue impact.
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "grid", gap: "14px" }}>
        {contributors.slice(0, 5).map((contributor, index) => (
          <div
            key={contributor.id}
            className="card"
            style={{ padding: "18px", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{index === 0 ? `🏆 ${contributor.name}` : contributor.name}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                  Productivity score based on time and output.
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--accent)" }}>
                {contributor.hours.toFixed(1)}h
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "18px" }}>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "4px" }}>Tasks completed</div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{contributor.tasksCompleted}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "4px" }}>Revenue generated</div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>
                  ₹{new Intl.NumberFormat("en-IN").format(Math.round(Number(contributor.revenue)))}

                </div>

              </div>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "4px" }}>Hours tracked</div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{contributor.hours.toFixed(1)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
