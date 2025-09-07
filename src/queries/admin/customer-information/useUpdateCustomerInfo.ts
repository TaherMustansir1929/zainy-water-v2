import {
  updateCustomerInfo,
  UpdateCustomerInfoDataProp,
} from "@/actions/admin/customer-information/admin-update-customer-info.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GetAllCustomersQueryConfig } from "./useGetAllCustomers";
import { useRouter } from "next/navigation";

export const useUpdateCustomerInfo = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, UpdateCustomerInfoDataProp>({
    mutationKey: ["update_customer_info"],
    mutationFn: async (data) => {
      await updateCustomerInfo(data);
    },
    onSuccess: () => {
      toast.success("Customer information updated successfully.");
      queryClient.invalidateQueries({
        queryKey: [GetAllCustomersQueryConfig.queryKey],
      });
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error updating customer information");
    },
  });
};
