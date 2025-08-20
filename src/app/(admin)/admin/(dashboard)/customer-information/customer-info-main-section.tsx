"use client";

import { HighlightText } from "@/components/animate-ui/text/highlight";
import { CustomerInfoTabs } from "./customer-info-tabs";
import { useGetAllCustomers } from "@/queries/admin/useGetAllCustomers";

export const CustomerInformationMainSection = () => {
  const customersQuery = useGetAllCustomers();
  const customersData = customersQuery.data;

  return (
    <div className="min-h-screen w-full p-4 max-w-7xl">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div>
              <span className={"text-2xl font-semibold"}>
                You have a total of{" "}
                <HighlightText
                  className="font-semibold"
                  text={`${customersData?.length ?? "_"}`}
                />{" "}
                active customers.
              </span>
            </div>
            <CustomerInfoTabs data={customersData} />
          </div>
        </div>
      </div>
    </div>
  );
};
