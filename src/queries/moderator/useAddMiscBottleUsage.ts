import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addMiscellaneousBottleUsage,
  MiscellaneousBottleUsageDataProps,
} from "@/actions/moderator/miscellaneous/misc-bottle-usage.action";
import { toast } from "sonner";

export const useAddMiscBottleUsage = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, MiscellaneousBottleUsageDataProps>({
    mutationKey: ["add_misc_bottle_usage"],
    mutationFn: async (data) => {
      await addMiscellaneousBottleUsage({ ...data });
      return data.moderator_id;
    },
    onSuccess: (id) => {
      toast.success("Miscellaneous bottle usage added successfully");
      queryClient.invalidateQueries({ queryKey: ["bottle_usage", id] });
      queryClient.invalidateQueries({ queryKey: ["total_bottles"] });
    },
    onError: (error) => {
      console.error("Error adding misc bottle usage", error);
      toast.error("Error adding misc bottle usage");
    },
  });
};
