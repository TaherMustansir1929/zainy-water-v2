"use client";

import { MainSectionCards } from "@/app/(admin)/_components/main-page-section-cards";
import { useGetDashboardAnalytics } from "@/queries/admin/dashboard/useGetDashboardAnalytics";
import { Loader2 } from "lucide-react";

function AdminMainSection() {
  const dashboardAnalyticsQuery = useGetDashboardAnalytics();
  const dashboardAnalyticsData = dashboardAnalyticsQuery.data;

  if (!dashboardAnalyticsData) {
    return (
      <div className={"flex justify-center items-center"}>
        <Loader2 className={"animate-spin size-6 text-primary"} />
      </div>
    );
  }

  return (
    <div className="w-full p-4 max-w-7xl">
      <div className={"mt-6"}>
        <MainSectionCards data={dashboardAnalyticsData} />
      </div>
    </div>
  );
}

export default AdminMainSection;
