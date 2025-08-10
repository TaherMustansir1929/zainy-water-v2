import { fetchTotalBottles } from "@/actions/fetch-total-bottles";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useFetchTotalBottles = () => {
  const query = useQuery({
    queryKey: ["total_bottles"],
    queryFn: async () => {
      try {
        const response = await fetchTotalBottles();

        if (!response.success) {
          throw new Error("Failed to fetch total bottles");
        }

        return response;
      } catch (error) {
        console.error("Error fetching total bottles:", error);
        toast.error("Failed to fetch total bottles");
      }
    },
  });

  return query;
};
