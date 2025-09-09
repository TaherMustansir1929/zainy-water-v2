import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { client, orpc } from "@/lib/orpc";

// Shared query configuration for server-side prefetching
export const fetchTotalBottlesQueryConfig = {
  queryKey: orpc.util.getTotalBottles.queryKey(),
  queryFn: async () => {
    try {
      const response = await client.util.getTotalBottles();

      if (!response.success) {
        throw new Error("Failed to fetch total bottles");
      }

      return response;
    } catch (error) {
      console.error("Error fetching total bottles:", error);
      throw error; // Re-throw for server-side prefetching
    }
  },
};

export const useFetchTotalBottles = () => {
  return useQuery({
    ...fetchTotalBottlesQueryConfig,
    queryFn: async () => {
      try {
        const response = await client.util.getTotalBottles();

        if (!response.success) {
          throw new Error("Failed to fetch total bottles");
        }

        return response;
      } catch (error) {
        console.error("Error fetching total bottles:", error);
        toast.error("Failed to fetch total bottles");
        throw error;
      }
    },
  });
};
