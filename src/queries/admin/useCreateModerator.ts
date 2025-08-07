import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Moderator as ModeratorPrisma } from "@prisma/client";
import { Moderator } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { createModerator } from "@/actions/admin/add-moderator-actions/admin-create-mod.action";
import { toast } from "sonner";

export const useCreateModerator = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ModeratorPrisma, Error, Moderator>({
    mutationKey: ["create_moderator"],
    mutationFn: async (data) => {
      const newModerator = await createModerator(data);
      return newModerator;
    },
    onSuccess: () => {
      toast.success("Moderator created successfully!");
      queryClient.invalidateQueries({ queryKey: ["moderator_list"] });
    },
    onError: (error) => {
      toast.error(`Failed to create moderator: ${error.message}`);
      console.error({ error });
    },
  });

  return mutation;
};
