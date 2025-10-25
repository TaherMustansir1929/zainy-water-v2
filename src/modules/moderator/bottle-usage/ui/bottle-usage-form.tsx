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
import { Separator } from "@/components/ui/separator";
import { TotalBottles } from "@/db/schema";
import { useConfirm } from "@/hooks/use-confirm";
import { orpc } from "@/lib/orpc";
import { useDOBStore } from "@/lib/ui-states/date-of-bottle-usage";
import { useModeratorStore } from "@/lib/ui-states/moderator-state";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCheckIcon,
  Loader2,
  SendHorizonal,
  Trash,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BottleReturnForm } from "./bottle-return-form";
import { BottleUsageTable } from "./bottle-usage-table";

const formSchema = z.object({
  filled_bottles: z.number().min(0),
  caps: z.number().min(0),
});

export const BottleUsageForm = () => {
  const { dob, setDOB } = useDOBStore();

  // Initialize DOB only once if not set
  useEffect(() => {
    if (!dob) {
      console.log(`Initializing DOB to ${new Date()}`);
      setDOB(new Date());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filled_bottles: 0,
      caps: 0,
    },
  });

  const moderator_id = useModeratorStore((state) => state.moderator?.id);

  const totalBottlesQuery = useQuery(
    orpc.util.getTotalBottles.queryOptions({})
  );
  const totalBottlesData = totalBottlesQuery?.data?.success
    ? totalBottlesQuery.data.totalBottles
    : ({} as typeof TotalBottles.$inferSelect);

  // Use dob from Zustand store instead of form.watch to prevent unnecessary re-renders
  const currentDob = dob;

  const bottleUsageQuery = useQuery({
    ...orpc.moderator.bottleUsage.getBottleUsage.queryOptions({
      input: { id: moderator_id || "", date: currentDob },
    }),
    enabled: !!moderator_id && !!currentDob, // Only run query when both values are valid
  });
  const bottleUsageData = bottleUsageQuery.data;

  const queryClient = useQueryClient();

  const bottleUsageMutation = useMutation(
    orpc.moderator.bottleUsage.addUpdateBottleUsage.mutationOptions({
      onSuccess: async () => {
        toast.success("Bottle usage added successfully");
        await queryClient.invalidateQueries({
          queryKey: orpc.moderator.bottleUsage.getBottleUsage.queryKey({
            input: { id: moderator_id || "", date: currentDob },
          }),
        });
      },
      onError: (err) => {
        console.error("Failed to add bottle usage", { err });
        toast.error(`Failed to add bottle usage: ${err.message}`);
      },
    })
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

    if (values.filled_bottles > totalBottlesData.available_bottles) {
      toast.error("Filled bottles cannot exceed available bottles");
      return;
    }

    const data = {
      moderator_id: moderator_id,
      dob: currentDob,
      filled_bottles: values.filled_bottles,
      caps: values.caps,
    };

    try {
      const response = await bottleUsageMutation.mutateAsync({ ...data });
      console.log({ response });
      // Reset only the filled_bottles and caps fields, keep the date
      form.reset();
    } catch (error) {
      alert("Failed to update bottle usage");
      console.error({ error });
    }
  }

  const doneMutation = useMutation(
    orpc.moderator.bottleUsage.markAsDone.mutationOptions({
      onSuccess: async () => {
        toast.success("Marked successfully");
        await queryClient.invalidateQueries({
          queryKey: orpc.moderator.bottleUsage.getBottleUsage.queryKey({
            input: { id: moderator_id || "", date: currentDob },
          }),
        });
      },
      onError: (err) => {
        console.error("Failed to mark done", { err });
        toast.error(`Failed to update: ${err.message}`);
      },
    })
  );

  const handleMarkAsDone = async (done: boolean) => {
    if (!moderator_id) {
      toast.error("Moderator ID is not available");
      return;
    }

    await doneMutation.mutateAsync({ id: moderator_id, done, dob: currentDob });
  };

  const deleteMutation = useMutation(
    orpc.moderator.bottleUsage.deleteBottleUsage.mutationOptions({
      onSuccess: async () => {
        toast.success("Deleted successfully");
        await queryClient.invalidateQueries({
          queryKey: orpc.moderator.bottleUsage.getBottleUsage.queryKey({
            input: { id: moderator_id || "", date: currentDob },
          }),
        });
      },
      onError: (err) => {
        console.error("Failed to delete bottle usage", { err });
        toast.error(`Failed to delete: ${err.message}`);
      },
    })
  );

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure you want to delete this record?",
    "This action will also permanently remove associated delivery records.",
    true
  );

  const handleDeleteBottleUsage = async (
    dob: Date | null,
    mod_id: string | undefined
  ) => {
    if (!dob || !mod_id) {
      toast.error("DOB or Moderator ID is unavailable. Refresh and try again.");
      return;
    }

    const ok = await confirm();
    if (!ok) return;

    await deleteMutation.mutateAsync({ dob, moderator_id: mod_id });
  };

  return (
    <>
      <ConfirmDialog />
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

            <div className="flex gap-4 items-center justify-between">
              <Button
                disabled={submitting}
                type="submit"
                className="flex-1 bg-primary disabled:opacity-100 disabled:hover:cursor-not-allowed shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/50 font-bold"
              >
                Submit
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <SendHorizonal className="size-4" />
                )}
              </Button>

              <Button
                type="button"
                variant={"destructive"}
                size={"icon"}
                onClick={() => handleDeleteBottleUsage(dob, moderator_id)}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-10">
          <div>
            <h1 className="w-full text-center font-bold">Bottles Return</h1>
          </div>
          <BottleReturnForm />
        </div>

        <Separator className="my-6" />

        <div className={"grid md:grid-cols-2 grid-cols-1 gap-4"}>
          <div className={"w-fit mx-auto md:mx-0"}>
            <h1 className="w-full font-bold">Sales and Expenses</h1>
            <p
              className={"font-mono w-full items-center grid grid-cols-2 gap-4"}
            >
              <span>Revenue:</span>
              <span>
                {bottleUsageData ? (
                  `{ Rs. ${bottleUsageData.revenue} }`
                ) : (
                  <Loader2 className={"animate-spin"} />
                )}
              </span>
            </p>
            <p className={"font-mono items-center grid grid-cols-2 gap-4"}>
              <span>Expense:</span>
              <span>
                {bottleUsageData ? (
                  `{ Rs. ${bottleUsageData.expense} }`
                ) : (
                  <Loader2 className={"animate-spin"} />
                )}
              </span>
            </p>
          </div>
          <div className="w-full flex md:justify-end items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleMarkAsDone(false)}
              className="text-gray-800 flex-1 md:w-fit"
            >
              <span>Revert done status</span>
              {doneMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Undo2 className="size-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleMarkAsDone(true)}
              className="flex-1 md:w-fit"
            >
              <span>Mark as done</span>
              {doneMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCheckIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
