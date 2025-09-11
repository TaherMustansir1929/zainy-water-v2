"use client";

import { BottleInventorySectionCards } from "@/modules/admin/bottle-inventory/ui/bottle-inventory-section-cards";
import { DataTable2BottleInventory } from "@/modules/admin/bottle-inventory/ui/data-table-2-bottle-inventory";

import { ChartLineInteractive } from "@/modules/admin/components/line-chart-interactive";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { BottleUsage30dDataSchema } from "@/modules/util/server/get30dBottleUsage.orpc";

export function BottleInventoryMainSection() {
  const totalBottlesQuery = useQuery(
    orpc.util.getTotalBottles.queryOptions({})
  );

  const bottleUsageQuery = useQuery(orpc.util.get30dBottleUsage.queryOptions());
  const bottleUsageData = bottleUsageQuery.data?.data;

  const totalBottles = totalBottlesQuery.data?.success
    ? totalBottlesQuery.data.totalBottles
    : undefined;

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

export function transformData(
  data: z.infer<typeof BottleUsage30dDataSchema>[]
) {
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
