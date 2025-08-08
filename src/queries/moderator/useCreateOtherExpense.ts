import {
  createOtherExpense,
  OtherExpenseData,
} from "@/actions/moderator/mod-other-exp.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateOtherExpense = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: true } | { success: false; error: string },
    Error,
    OtherExpenseData
  >({
    mutationKey: ["create_other_expense"],
    mutationFn: async (data) => {
      const response = await createOtherExpense(data);
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["bottle_usage", data.moderator_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["total_bottles"],
        });
      }
      return response;
    },
  });
};
