import { fetchAllCustomers } from "@/actions/fetch-all-customers.action";
import { useQuery } from "@tanstack/react-query";

export const GetAllCustomersQueryConfig = {
  queryKey: ["get_all_customers"],
  queryFn: async () => {
    const response = await fetchAllCustomers();
    return response;
  },
};

export const useGetAllCustomers = () => {
  return useQuery(GetAllCustomersQueryConfig);
};
