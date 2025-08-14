import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { get30dBottleUsageQueryConfig } from "@/queries/admin/useGet30dBottleUsage";
import { fetchTotalBottlesQueryConfig } from "@/queries/moderator/useFetchTotalBottles";
import { Suspense } from "react";
import { Atom } from "react-loading-indicators";
import { ErrorBoundary } from "react-error-boundary";
import ErrorState from "@/components/hydration-states/error-state";
import { BottleInventoryMainSection } from "./bottle-inventory-main-section";
import { getModeratorListQueryConfig } from "@/queries/admin/useGetModeratorList";

const BottleInventoryPage = async () => {
  const queryClient = new QueryClient();

  // Prefetch both queries in parallel for better performance
  await Promise.all([
    queryClient.prefetchQuery(get30dBottleUsageQueryConfig),
    queryClient.prefetchQuery(fetchTotalBottlesQueryConfig),
    queryClient.prefetchQuery(getModeratorListQueryConfig),
  ]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center">
      <WelcomeSection
        text="Here you can monitor bottle usage and inventory for your platform."
        greeting="Hey there"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Atom color="#47a1f4" size="medium" />}>
          <ErrorBoundary fallback={<ErrorState />}>
            <BottleInventoryMainSection />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};
export default BottleInventoryPage;
