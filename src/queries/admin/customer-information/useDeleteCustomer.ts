import { deleteCustomerById } from "@/actions/admin/customer-information/admin-delete-customer.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GetAllCustomersQueryConfig } from "./useGetAllCustomers";

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, { id: string }>({
    mutationKey: ["delete_customer"],
    mutationFn: async (data) => {
      await deleteCustomerById(data.id);
    },
    onSuccess: () => {
      toast.success("Customer deleted successfully");
      console.log("Customer deleted successfully");
      queryClient.invalidateQueries({
        queryKey: [GetAllCustomersQueryConfig.queryKey],
      });
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error deleting customer");
    },
  });
};
