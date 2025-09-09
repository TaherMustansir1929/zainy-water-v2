"use client";

import { BottleInventorySectionCards } from "@/app/(admin)/_components/bottle-inventory-section-cards";
import { DataTable2BottleInventory } from "@/app/(admin)/admin/(dashboard)/bottle-inventory/data-table-2-bottle-inventory";

import { useFetchTotalBottles } from "@/modules/util/server/queries/useFetchTotalBottles";
import { BottleUsage30dDataProps } from "@/actions/fetch-30d-bottle-usage.action";
import { useGet30dBottleUsage } from "@/queries/admin/useGet30dBottleUsage";
import { ChartLineInteractive } from "@/app/(admin)/_components/line-chart-interactive";

export function BottleInventoryMainSection() {
  const totalBottlesQuery = useFetchTotalBottles();
  const totalBottles = totalBottlesQuery.data?.totalBottles;

  const bottleUsageQuery = useGet30dBottleUsage();
  const bottleUsageData = bottleUsageQuery.data;

  let rawChartData: {
    date: string;
    targets: {
      label: string;
      value: number;
    }[];
  }[] = [];

  if (bottleUsageData) {
    rawChartData = transformData(bottleUsageData);
  }

  return (
    <div className="min-h-screen w-full p-4 max-w-7xl">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <BottleInventorySectionCards total_bottles={totalBottles} />
            <div className="px-4 lg:px-6">
              {/*<ChartAreaInteractive*/}
              {/*  rawChartData={rawChartData}*/}
              {/*  title={"Total Bottle Usage"}*/}
              {/*/>*/}
              <ChartLineInteractive
                rawChartData={rawChartData}
                title={"Total Bottle Usage"}
              />
            </div>
            <DataTable2BottleInventory data={bottleUsageData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function transformData(data: BottleUsage30dDataProps[]) {
  const grouped: Record<string, { label: string; value: number }[]> = {};

  data.forEach((item) => {
    const date = item.bottleUsage.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push({
      label: item.moderator.name,
      value: item.bottleUsage.filled_bottles,
    });
  });

  return Object.entries(grouped).map(([date, targets]) => ({
    date,
    targets,
  }));
}
