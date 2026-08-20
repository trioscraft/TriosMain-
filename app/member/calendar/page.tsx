import RoleGuard from "@/components/RoleGuard";
import CalendarPageClient from "@/components/admin/calendar/CalendarPageClient";

export default async function MemberCalendarPage() {
  return (
    <RoleGuard allowedRoles={["member"]}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Schedule</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Calendar & Deadlines
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
            Drag tasks to reschedule and stay ahead of deadlines.
          </p>
        </div>
        <CalendarPageClient />
      </div>
    </RoleGuard>
  );
}