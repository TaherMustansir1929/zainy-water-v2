import { getAllModeratorList } from "@/actions/admin/add-moderator-actions/admin-get-mod-list";
import { useQuery } from "@tanstack/react-query";

export const useGetModeratorList = () => {
  const query = useQuery({
    queryKey: ["moderator_list"],
    queryFn: async () => {
      const data = await getAllModeratorList();

      return data.map((mod) => ({
        name: mod.name,
        password: mod.password,
        areas: mod.areas,
        isWorking: mod.isWorking,
      }));
    },
  });

  return query;
};
