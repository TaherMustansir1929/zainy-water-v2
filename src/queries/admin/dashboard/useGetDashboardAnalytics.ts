import { useQuery } from "@tanstack/react-query";
import { fetchDashboardAnalytics } from "@/actions/admin/dashboard/admin-dashboard-analytics.action";

export const dashboardAnalyticsQueryConfig = {
  queryKey: ["dashboard_analytics"],
  queryFn: async () => {
    const response = await fetchDashboardAnalytics();
    return response;
  },
}

export const useGetDashboardAnalytics = () => {
  return useQuery(dashboardAnalyticsQueryConfig);
}