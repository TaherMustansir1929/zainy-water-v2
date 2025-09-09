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
import { Input } from "@/components/ui/input";
import { Loader2, SendHorizonal } from "lucide-react";
import { useModeratorStore } from "@/lib/moderator-state";
import { toast } from "sonner";
import { useFetchTotalBottles } from "@/modules/util/server/queries/useFetchTotalBottles";
import { BottleUsageTable } from "./bottle-usage-table";
import { BottleReturnForm } from "./bottle-return-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

const formSchema = z.object({
  filled_bottles: z.number().min(0),
  caps: z.number().min(0),
});

export const BottleUsageForm = () => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filled_bottles: 0,
      caps: 0,
    },
  });

  const moderator_id = useModeratorStore((state) => state.moderator?.id);

  const totalBottlesQuery = useFetchTotalBottles();
  const bottleUsageQuery = useQuery(
    orpc.moderator.bottleUsage.getBottleUsage.queryOptions({
      input: { id: moderator_id },
    }),
  );
  const queryClient = useQueryClient();
  const bottleUsageMutation = useMutation(
    orpc.moderator.bottleUsage.addUpdateBottleUsage.mutationOptions({
      onSuccess: async () => {
        toast.success("Bottle usage added successfully");
        await queryClient.invalidateQueries({
          queryKey: orpc.moderator.bottleUsage.getBottleUsage.queryKey({
            input: { id: moderator_id },
          }),
        });
      },
      onError: (err) => {
        console.error("Failed to add bottle usage", { err });
        toast.error("Failed to add bottle usage");
      },
    }),
  );

  const submitting = bottleUsageMutation.isPending;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!moderator_id) {
      toast.error("Moderator ID is not available");
      return;
    }

    if (!totalBottlesQuery.data) {
      return;
    }

    if (
      values.filled_bottles >
      totalBottlesQuery.data.totalBottles.available_bottles
    ) {
      toast.error("Filled bottles cannot exceed available bottles");
      return;
    }

    const data = {
      moderator_id: moderator_id,
      filled_bottles: values.filled_bottles,
      caps: values.caps,
    };

    try {
      const response = await bottleUsageMutation.mutateAsync({ ...data });
      console.log({ response });
      form.reset(); // Reset the form
    } catch (error) {
      alert("Failed to update bottle usage");
      console.error({ error });
    }
  }

  return (
    <div>
      <BottleUsageTable
        totalBottlesQuery={totalBottlesQuery}
        bottleUsageQuery={bottleUsageQuery}
      />

      <div className="w-full flex justify-center items-center gap-2">
        <h1 className="font-bold">Bottles Taken</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="filled_bottles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filled Bottles</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="00"
                    type="number"
                    onChange={(e) => {
                      const value = e.target.value;
                      // Convert to number or null if empty
                      field.onChange(value ? parseFloat(value) : null);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Total bottles filled from main plant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="caps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caps</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="00"
                    type="number"
                    onChange={(e) => {
                      const value = e.target.value;
                      // Convert to number or null if empty
                      field.onChange(value ? parseFloat(value) : null);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Total caps used from main plant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={submitting}
            type="submit"
            className="w-full bg-primary disabled:opacity-100 disabled:hover:cursor-not-allowed shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/50 font-bold"
          >
            Submit
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <SendHorizonal className="size-4" />
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-10">
        <div>
          <h1 className="w-full text-center font-bold">Bottles Return</h1>
        </div>
        <BottleReturnForm />
      </div>
    </div>
  );
};
