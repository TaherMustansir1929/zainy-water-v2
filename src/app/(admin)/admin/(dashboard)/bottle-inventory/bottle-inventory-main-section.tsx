"use client";

import { ChartAreaInteractive } from "@/app/(admin)/_components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { DataTable2 } from "@/app/(admin)/_components/data-table-2";

import { useFetchTotalBottles } from "@/queries/moderator/useFetchTotalBottles";

import data from "./data.json";
import { useGet90dBottleUsage } from "@/queries/admin/useGet90dBottleUsage";
import { BottleUsage90dDataProps } from "@/actions/fetch-90d-bottle-usage";

export function BottleInventoryMainSection() {
  const totalBottlesQuery = useFetchTotalBottles();
  const totalBottles = totalBottlesQuery.data?.totalBottles;

  const bottleUsageQuery = useGet90dBottleUsage();
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
    <div className="w-full p-4 max-w-7xl">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards total_bottles={totalBottles} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive rawChartData={rawChartData} />
            </div>
            <DataTable2 data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

function transformData(data: BottleUsage90dDataProps[]) {
  const grouped: Record<string, { label: string; value: number }[]> = {};

  data.forEach((item) => {
    const date = item.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push({
      label: item.moderator_name,
      value: item.filled_bottles,
    });
  });

  return Object.entries(grouped).map(([date, targets]) => ({
    date,
    targets,
  }));
}
