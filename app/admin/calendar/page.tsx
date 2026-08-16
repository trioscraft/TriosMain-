import RoleGuard from "@/components/RoleGuard";
import CalendarPageClient from "@/components/admin/calendar/CalendarPageClient";

export default async function CalendarPage() {
  return (
    <RoleGuard allowedRoles={["admin", "member"]}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 18,
          }}
        >
          Calendar & Deadlines
        </h1>
        <CalendarPageClient />
      </div>
    </RoleGuard>
  );
}


