"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, SendHorizonal } from "lucide-react";
import { BottleInput } from "@/components/bottle-input";
import { useModeratorStore } from "@/lib/ui-states/moderator-state";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

const formSchema = z.object({
  empty_bottles: z.number().min(0),
  damaged_bottles: z.number().min(0),
});

export function MiscBottleUsageForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empty_bottles: 0,
      damaged_bottles: 0,
    },
  });

  const moderator_id = useModeratorStore((state) => state.moderator?.id);

  const queryClient = useQueryClient();
  const addMiscRecordMutation = useMutation(
    orpc.moderator.miscellaneous.addMiscBottleUsage.mutationOptions({
      onSuccess: async () => {
        toast.success("Miscellaneous bottle usage added successfully");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.moderator.bottleUsage.getBottleUsage.queryKey({
              input: { id: moderator_id || "", date: new Date() },
            }),
          }),
          queryClient.invalidateQueries({ queryKey: ["total_bottles"] }),
        ]);
      },
      onError: (error) => {
        console.error("Error adding misc bottle usage", error);
        toast.error("Error adding misc bottle usage");
      },
    })
  );

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!moderator_id) {
      toast.error("Moderator ID is not available");
      return;
    }

    await addMiscRecordMutation.mutateAsync({
      moderator_id,
      ...values,
    });
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className={"grid grid-cols-2 gap-4"}>
            <FormField
              control={form.control}
              name="empty_bottles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empty Bottles</FormLabel>
                  <FormControl>
                    <BottleInput
                      field={field}
                      onChange={field.onChange}
                      defaultValue={0}
                      disabled={true}
                    />
                  </FormControl>
                  <FormDescription>
                    Empty bottles received miscellaneously
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="damaged_bottles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damaged Bottles</FormLabel>
                  <FormControl>
                    <BottleInput
                      field={field}
                      onChange={field.onChange}
                      defaultValue={0}
                      disabled={true}
                    />
                  </FormControl>
                  <FormDescription>
                    Damaged bottles (miscellaneous)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={true}
            type="submit"
            className="w-full bg-primary disabled:opacity-100 disabled:hover:cursor-not-allowed shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/50 font-bold"
          >
            Submit
            {false ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizonal className="size-4" />
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
