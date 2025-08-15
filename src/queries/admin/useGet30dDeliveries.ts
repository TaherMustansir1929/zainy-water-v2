import { useQuery } from "@tanstack/react-query";
import { fetch30DDeliveries } from "@/actions/fetch-30d-deliveries.action";

export const get30dDeliveriesQueryConfig = {
  queryKey: ["30d_deliveries"],
  queryFn: async () => {
    return await fetch30DDeliveries();
  },
};

export const useGet30dDeliveries = () => {
  return useQuery({
    ...get30dDeliveriesQueryConfig,
  });
};
