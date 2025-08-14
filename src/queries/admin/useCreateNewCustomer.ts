import {
  createNewCustomer,
  CreateNewCustomerDataProp,
} from "@/actions/admin/customer-information/admin-create-customer.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GetAllCustomersQueryConfig } from "./useGetAllCustomers";
import { useRouter } from "next/navigation";

export const useCreateNewCustomer = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, CreateNewCustomerDataProp>({
    mutationKey: ["create_new_customer"],
    mutationFn: async (data) => {
      await createNewCustomer(data);
    },
    onSuccess: () => {
      toast.success("Customer created successfully!");
      queryClient.invalidateQueries({
        queryKey: [GetAllCustomersQueryConfig.queryKey],
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error("Error creating customer: " + error.message);
      console.error(error);
    },
  });
};
