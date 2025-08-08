import { fetchModeratorBottleUsage } from "@/actions/moderator/bottle-usage/fetch-bottle-usage";
import { useQuery } from "@tanstack/react-query";

export const useFetchBottleUsage = (id: string | null) => {
  const query = useQuery({
    queryKey: ["bottle_usage", id],
    queryFn: async () => {
      if (!id) return Promise.resolve();
      return await fetchModeratorBottleUsage(id);
    },
  });

  return query;
};
