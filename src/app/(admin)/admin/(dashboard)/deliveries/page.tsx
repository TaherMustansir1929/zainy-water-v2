"use server";

import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import { DeliveriesMainSection } from "@/app/(admin)/admin/(dashboard)/deliveries/deliveries-main-section";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { get30dDeliveriesQueryConfig } from "@/queries/admin/useGet30dDeliveries";
import { Atom } from "react-loading-indicators";
import ErrorState from "@/components/hydration-states/error-state";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { get30dMiscDeliveriesQueryConfig } from "@/queries/admin/useGet30dMiscDeliveries";

export default async function DeliveriesPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(get30dDeliveriesQueryConfig),
    queryClient.prefetchQuery(get30dMiscDeliveriesQueryConfig),
  ]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center">
      <WelcomeSection
        text={"Here you can manage deliveries for your platform."}
        greeting="Hello"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Atom color="#47a1f4" size="medium" />}>
          <ErrorBoundary fallback={<ErrorState />}>
            <DeliveriesMainSection />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
