import { useQuery } from "@tanstack/react-query";
import { fetch30DMiscDeliveries } from "@/actions/fetch-30d-misc-deliveries.action";

export const get30dMiscDeliveriesQueryConfig = {
  queryKey: ["30d_misc_deliveries"],
  queryFn: async () => {
    const response = await fetch30DMiscDeliveries();
    return response;
  },
};

export const useGet30dMiscDeliveries = () => {
  return useQuery(get30dMiscDeliveriesQueryConfig);
};
