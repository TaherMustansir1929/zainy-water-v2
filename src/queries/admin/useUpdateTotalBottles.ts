import {
  TotalBottlesDataProp,
  updateTotalBottles,
} from "@/actions/admin/bottle-inventory/admin-update-total-bottles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useUpdateTotalBottles = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, TotalBottlesDataProp>({
    mutationKey: ["update_total_bottles"],
    mutationFn: async (data) => {
      try {
        const response = await updateTotalBottles(data);

        if (response.success) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
          console.error({ response });
        }
      } catch (error) {
        toast.error("Failed to update total bottles");
        console.error({ error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["total_bottles"] });
      router.refresh();
    },
  });
};
