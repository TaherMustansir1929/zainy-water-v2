import { fetch30dBottleUsage } from "@/actions/fetch-30d-bottle-usage";
import { useQuery } from "@tanstack/react-query";

// Shared query configuration for server-side prefetching
export const get30dBottleUsageQueryConfig = {
  queryKey: ["30d_bottle_usage"],
  queryFn: async () => {
    const response = await fetch30dBottleUsage();
    return response.data;
  },
  staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
  gcTime: 10 * 60 * 1000, // 10 minutes - how long to keep in cache
};

export const useGet30dBottleUsage = () => {
  const query = useQuery(get30dBottleUsageQueryConfig);
  return query;
};
