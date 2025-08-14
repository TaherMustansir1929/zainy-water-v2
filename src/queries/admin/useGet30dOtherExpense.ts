import { fetch30dOtherExpense } from "@/actions/fetch-30d-other-expense.action"
import { useQuery } from "@tanstack/react-query";

export const get30dOtherExpenseQueryConfig = {
  queryKey: ["30d_other_expense"],
  queryFn: async () => {
    const response = fetch30dOtherExpense();
    return response;
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 10,
}

export const useGet30dOtherExpense = () => {
  return useQuery(get30dOtherExpenseQueryConfig);
}
