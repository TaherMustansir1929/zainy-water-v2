import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateMiscDelivery,
  UpdateMiscDeliveryDataProps,
} from "@/actions/admin/deliveries/admin-update-misc-delivery.action";
import { toast } from "sonner";
import { get30dMiscDeliveriesQueryConfig } from "@/queries/admin/useGet30dMiscDeliveries";
import { useRouter } from "next/navigation";

export const useUpdateMiscDeliveryRecord = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    { success: boolean; message: string },
    Error,
    UpdateMiscDeliveryDataProps
  >({
    mutationKey: ["update_misc_delivery_record"],
    mutationFn: async (data) => {
      return await updateMiscDelivery(data);
    },
    onSuccess: () => {
      toast.success("Miscellaneous delivery record updated successfully");
      queryClient.invalidateQueries({
        queryKey: [get30dMiscDeliveriesQueryConfig.queryKey],
      });
      router.refresh();
    },
    onError: (error) => {
      console.error("Failed to update misc delivery record", { error });
      toast.error(`Failed to update: ${error.message}`);
    },
  });
};
