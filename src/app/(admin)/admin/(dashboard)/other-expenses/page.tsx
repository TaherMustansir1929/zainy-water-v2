import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import { OtherExpenseMainSection } from "./other-exp-main-section";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { get30dOtherExpenseQueryConfig } from "@/queries/admin/useGet30dOtherExpense";
import ErrorState from "@/components/hydration-states/error-state";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { Atom } from "react-loading-indicators";

export default async function OtherExpensePage() {
  const queryClient = new QueryClient();

  await Promise.all([queryClient.prefetchQuery(get30dOtherExpenseQueryConfig)]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center">
      <WelcomeSection
        text={"Here you can manage extra expenses for your business."}
        greeting="Hi there"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Atom color="#47a1f4" size="medium" />}>
          <ErrorBoundary fallback={<ErrorState />}>
            <OtherExpenseMainSection />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
