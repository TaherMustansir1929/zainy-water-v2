import { getAllModeratorList } from "@/actions/admin/add-moderator-actions/admin-get-mod-list";
import { useQuery } from "@tanstack/react-query";

export const getModeratorListQueryConfig = {
  queryKey: ["moderator_list"],
  queryFn: async () => {
    const data = await getAllModeratorList();

    return data.map((mod) => ({
      id: mod.id,
      name: mod.name,
      password: mod.password,
      areas: mod.areas,
      isWorking: mod.isWorking,
    }));
  },
};

export const useGetModeratorList = () => {
  const query = useQuery(getModeratorListQueryConfig);
  return query;
};
