import { fetch30dBottleUsage } from "@/actions/fetch-30d-bottle-usage.action";
import { useQuery } from "@tanstack/react-query";

// Shared query configuration for server-side prefetching
export const get30dBottleUsageQueryConfig = {
  queryKey: ["30d_bottle_usage"],
  queryFn: async () => {
    const response = await fetch30dBottleUsage();
    return response.data;
  },
};

export const useGet30dBottleUsage = () => {
  const query = useQuery(get30dBottleUsageQueryConfig);
  return query;
};
