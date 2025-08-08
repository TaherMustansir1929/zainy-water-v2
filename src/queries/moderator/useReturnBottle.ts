import { returnBottleUsage } from "@/actions/moderator/bottle-usage/return-bottle-usage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type DataProps = {
  moderator_id: string;
  empty_bottles: number;
  remaining_bottles: number;
  caps: number;
};

export const useReturnBottle = () => {
  const queryClient = useQueryClient();

  return useMutation<DataProps, Error, DataProps>({
    mutationKey: ["return_bottles"],
    mutationFn: async (data) => {
      await returnBottleUsage(data);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Bottles return successful");
      queryClient.invalidateQueries({ queryKey: ["total_bottles"] });
      queryClient.invalidateQueries({
        queryKey: ["bottle_usage", data.moderator_id],
      });
    },
    onError: (error) => {
      toast.error("Bottles return failed");
      console.error("Error details:", error);
    },
  });
};
