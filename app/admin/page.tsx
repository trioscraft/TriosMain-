import RoleGuard from "@/components/RoleGuard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { getAnalyticsData } from "@/lib/analytics";

export default async function Home() {
  const analytics = await getAnalyticsData();

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AnalyticsDashboard initialData={analytics} />
    </RoleGuard>
  );
}
