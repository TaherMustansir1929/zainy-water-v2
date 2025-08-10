"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { DataTable2 } from "@/app/(admin)/_components/data-table-2";

import { useFetchTotalBottles } from "@/queries/moderator/useFetchTotalBottles";

import data from "./data.json";

export function BottleInventoryMainSection() {
  const totalBottlesQuery = useFetchTotalBottles();
  const totalBottles = totalBottlesQuery.data?.totalBottles;

  return (
    <div className="w-full p-4 max-w-7xl">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards total_bottles={totalBottles} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable2 data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
