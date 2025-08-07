import { updateModeratorByName } from "@/actions/admin/add-moderator-actions/admin-update-mod.action";
import { Moderator } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Moderator as ModeratorPrisma } from "@prisma/client";
import { toast } from "sonner";

export const useUpdateModerator = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ModeratorPrisma,
    Error,
    { name: string; data: Moderator }
  >({
    mutationKey: ["update_moderator"],
    mutationFn: async ({ name, data }) => {
      const updatedModerator = await updateModeratorByName(name, data);
      return updatedModerator;
    },
    onSuccess: () => {
      toast.success("Moderator updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["moderator_list"] });
    },
    onError: (error) => {
      toast.error(`Failed to update moderator: ${error.message}`);
      console.error({ error });
    },
  });

  return mutation;
};
