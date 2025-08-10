import { fetch90dBottleUsage } from "@/actions/fetch-90d-bottle-usage";
import { useQuery } from "@tanstack/react-query";

export const useGet90dBottleUsage = () => {
  return useQuery({
    queryKey: ["90d_bottle_usage"],
    queryFn: async () => {
      const response = await fetch90dBottleUsage();
      return response.data;
    },
  });
};
