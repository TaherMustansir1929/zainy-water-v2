import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import AdminMainSection from "@/app/(admin)/admin/(dashboard)/admin-main-section";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { dashboardAnalyticsQueryConfig } from "@/queries/admin/dashboard/useGetDashboardAnalytics";
import { Suspense } from "react";
import { Atom } from "react-loading-indicators";
import { ErrorBoundary } from "react-error-boundary";
import ErrorState from "@/components/hydration-states/error-state";

const AdminPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([queryClient.prefetchQuery(dashboardAnalyticsQueryConfig)]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center">
      <WelcomeSection
        text={
          "Welcome to Zainy Water Admin panel. A modern and user-friendly platform for managing your business."
        }
        greeting="Welcome"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Atom color="#47a1f4" size="medium" />}>
          <ErrorBoundary fallback={<ErrorState />}>
            <AdminMainSection />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};
export default AdminPage;
