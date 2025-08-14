import { useQuery } from "@tanstack/react-query";
import { fetch30DDeliveries } from "@/actions/fetch-30d-deliveries.action";

export const get30dDeliveriesQueryConfig = {
  queryKey: ["30d_deliveries"],
  queryFn: async () => {
    return await fetch30DDeliveries();
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 10,
};

export const useGet30dDeliveries = () => {
  return useQuery({
    ...get30dDeliveriesQueryConfig,
  });
};
