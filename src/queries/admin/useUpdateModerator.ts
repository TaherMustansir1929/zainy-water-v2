import { updateModeratorByName } from "@/actions/admin/add-moderator-actions/admin-update-mod.action";
import { Moderator as ModeratorData } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Moderator } from "@/db/schema";
import { useRouter } from "next/navigation";

export const useUpdateModerator = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<
    typeof Moderator.$inferSelect,
    Error,
    { name: string; data: ModeratorData }
  >({
    mutationKey: ["update_moderator"],
    mutationFn: async ({ name, data }) => {
      const updatedModerator = await updateModeratorByName(name, data);
      return updatedModerator;
    },
    onSuccess: () => {
      toast.success("Moderator updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["moderator_list"] });
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to update moderator: ${error.message}`);
      console.error({ error });
    },
  });

  return mutation;
};
