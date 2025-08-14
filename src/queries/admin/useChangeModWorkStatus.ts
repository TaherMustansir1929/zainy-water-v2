import { changeModeratorWorkingStatus } from "@/actions/admin/add-moderator-actions/admin-mod-change-status.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useChangeModWorkStatus = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<
    void,
    Error,
    { name: string; isWorking: boolean }
  >({
    mutationKey: ["change_mod_work_status"],
    mutationFn: async (data) => {
      await changeModeratorWorkingStatus(data.name, data.isWorking);
    },
    onSuccess: () => {
      toast.success("Moderator work status changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["moderator_list"] });
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to change moderator work status: ${error.message}`);
      console.error("Error changing moderator work status:", error);
      throw error;
    },
  });

  return mutation;
};
