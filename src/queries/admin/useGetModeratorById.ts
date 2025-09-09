import { fetchModeratorById } from "@/actions/fetch-moderator-by-id.action";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetModeratorById = (mod_id: string) => {
  return useQuery({
    queryKey: ["moderator", mod_id],
    queryFn: () => {
      try {
        const response = fetchModeratorById(mod_id);
        if (!!response) {
          return response;
        }

        throw new Error(`Moderator with id: ${mod_id} not found`);
      } catch (error) {
        console.error("Error fetching moderator:", error);
        toast.error(error instanceof Error ? error.message : "Unknown error");
      }
    },
  });
};
