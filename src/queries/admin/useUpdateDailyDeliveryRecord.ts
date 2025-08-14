import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateDailyDelivery,
  UpdateDailyDeliveryDataProps,
} from "@/actions/admin/deliveries/admin-update-daily-delivery.action";
import { toast } from "sonner";
import { get30dDeliveriesQueryConfig } from "@/queries/admin/useGet30dDeliveries";
import { useRouter } from "next/navigation";

export const useUpdateDailyDeliveryRecord = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    { success: boolean; message: string },
    Error,
    UpdateDailyDeliveryDataProps
  >({
    mutationKey: ["update_daily_delivery_record"],
    mutationFn: async (data) => {
      const response = await updateDailyDelivery(data);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: [get30dDeliveriesQueryConfig.queryKey],
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
      console.error("Failed to update daily delivery record", { error });
    },
  });
};
