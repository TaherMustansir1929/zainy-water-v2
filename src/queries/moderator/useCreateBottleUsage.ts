import { modAddUpdateBottleUsage } from "@/actions/moderator/bottle-usage/add-update-bottle-usage.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type DataProps = {
  moderator_id: string;
  filled_bottles: number;
  caps: number;
};

export const useCreateBottleUsage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { data: DataProps; success: boolean },
    Error,
    DataProps
  >({
    mutationKey: ["create_bottle_usage"],
    mutationFn: async (data) => {
      const response = await modAddUpdateBottleUsage(data);

      if (!response.success) throw new Error("Failed to create bottle usage");

      return { data: data, success: response.success };
    },
    onSuccess: (data) => {
      toast.success("Bottle usage added successfully");
      queryClient.invalidateQueries({ queryKey: ["total_bottles"] });
      queryClient.invalidateQueries({
        queryKey: ["bottle_usage", data.data.moderator_id],
      });
    },
    onError: (error) => {
      toast.error("Failed to add bottle usage");
      console.error("Failed to add bottle usage", { error });
    },
  });

  return mutation;
};
