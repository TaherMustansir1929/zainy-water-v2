import {
  updateOtherExpense,
  UpdateOtherExpenseDataProps,
} from "@/actions/admin/other-expense/updateOtherExpense.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { get30dOtherExpenseQueryConfig } from "./useGet30dOtherExpense";
import { useRouter } from "next/navigation";

export const useUpdateOtherExpense = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, UpdateOtherExpenseDataProps>({
    mutationKey: ["update_other_expense"],
    mutationFn: async (data) => {
      await updateOtherExpense(data);
    },
    onSuccess: () => {
      toast.success("Updated Expense successfully");
      queryClient.invalidateQueries({
        queryKey: [get30dOtherExpenseQueryConfig.queryKey],
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
      console.error("Error updating other expense", { error });
    },
  });
};
