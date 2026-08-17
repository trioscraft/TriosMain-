import { Trophy, Users } from "lucide-react";
import type { ContributorAnalytics } from "@/lib/types/analytics";
import { ChartCard } from "@/components/admin/ui/Card";

export default function TopContributors({ contributors }: { contributors: ContributorAnalytics[] }) {
  return (
    <ChartCard
      icon={<Trophy size={19} />}
      label="Top Contributors"
      title="Team performance leaders"
      description="Hours, completed tasks and revenue impact."
    >
      <div style={{ display: "grid", gap: 14 }}>
        {contributors.slice(0, 5).map((contributor, index) => (
          <div key={contributor.id} className="card" style={{ padding: 18, border: "1px solid var(--glass-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    background: index === 0 ? "var(--accent-soft)" : "var(--glass-bg)",
                    border: index === 0 ? "1px solid var(--border-accent)" : "1px solid var(--glass-border)",
                    color: index === 0 ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  #{index + 1}
                </span>
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 700 }}>{contributor.name}</div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: 12.5, marginTop: 2 }}>Productivity score from output & time</div>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{contributor.hours.toFixed(1)}h</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 11.5, marginBottom: 4 }}>Tasks done</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{contributor.tasksCompleted}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 11.5, marginBottom: 4 }}>Revenue</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>₹{new Intl.NumberFormat("en-IN").format(Math.round(Number(contributor.revenue)))}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 11.5, marginBottom: 4 }}>Hours</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{contributor.hours.toFixed(1)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
