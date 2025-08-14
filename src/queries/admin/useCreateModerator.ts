import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Moderator as ModeratorData } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { createModerator } from "@/actions/admin/add-moderator-actions/admin-create-mod.action";
import { toast } from "sonner";
import { Moderator } from "@/db/schema";
import { useRouter } from "next/navigation";

export const useCreateModerator = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<
    typeof Moderator.$inferSelect,
    Error,
    ModeratorData
  >({
    mutationKey: ["create_moderator"],
    mutationFn: async (data) => {
      const newModerator = await createModerator(data);
      return newModerator;
    },
    onSuccess: () => {
      toast.success("Moderator created successfully!");
      queryClient.invalidateQueries({ queryKey: ["moderator_list"] });
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to create moderator: ${error.message}`);
      console.error({ error });
    },
  });

  return mutation;
};
