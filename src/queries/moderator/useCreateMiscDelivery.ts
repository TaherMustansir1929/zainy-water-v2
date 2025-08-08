import {
  addMiscDelivery,
  MiscDeliveryProps,
} from "@/actions/moderator/miscellaneous/misc-delivery.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateMiscDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MiscDeliveryProps>({
    mutationKey: ["create_misc_delivery"],
    mutationFn: async (data) => {
      await addMiscDelivery(data);

      queryClient.invalidateQueries({
        queryKey: ["bottle_usage", data.moderator_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["total_bottles"],
      });
    },
    onSuccess: () => {
      toast.success("Miscellaneous delivery added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding miscellaneous delivery: ${error.message}`);
    },
  });
};
