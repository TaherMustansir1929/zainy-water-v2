import { useMutation } from "@tanstack/react-query";
import {
  deleteDailyDelivery,
  DeleteDeliveryDataProp,
} from "@/actions/moderator/deliveries/mod-delete-delivery.action";
import { toast } from "sonner";

export const useDeleteDailyDelivery = () => {
  return useMutation<void, Error, DeleteDeliveryDataProp>({
    mutationKey: ["delete_daily_delivery"],
    mutationFn: async (data) => {
      await deleteDailyDelivery(data);
    },
    onSuccess: () => {
      toast.success("Delivery deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete delivery: ${error.message}`);
      console.error("Failed to delete delivery", { error });
    },
  });
};
