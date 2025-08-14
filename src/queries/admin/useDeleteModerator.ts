import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteModerator } from "@/actions/admin/add-moderator-actions/admin-delete-mod.action";
import { useRouter } from "next/navigation";

export const useDeleteModerator = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<void, Error, { name: string }>({
    mutationKey: ["delete_moderator"],
    mutationFn: async (data) => {
      await deleteModerator(data.name);
    },
    onSuccess: () => {
      toast.success("Moderator deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["moderator_list"] });
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to delete moderator: ${error.message}`);
      console.error({ error });
    },
  });

  return mutation;
};
