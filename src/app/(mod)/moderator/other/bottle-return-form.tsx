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
import { useReturnBottle } from "@/queries/moderator/useReturnBottle";
import { useModeratorStore } from "@/lib/moderator-state";
import { toast } from "sonner";

const formSchema = z.object({
  empty_bottles: z.number().min(0),
  remaining_bottles: z.number().min(0),
  caps: z.number().min(0),
});

export const BottleReturnForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empty_bottles: 0,
      remaining_bottles: 0,
      caps: 0,
    },
  });

  const moderator_id = useModeratorStore((state) => state.moderator?.id);

  const bottleReturnMutation = useReturnBottle();
  const submitting = bottleReturnMutation.isPending;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!moderator_id) {
      toast.error("Moderator ID is not available");
      return;
    }

    await bottleReturnMutation.mutateAsync({
      moderator_id,
      ...values,
    });

    form.reset();
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="empty_bottles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empty Bottles</FormLabel>
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
                  This is the number of empty bottles you are returning.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remaining_bottles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remaining Bottles</FormLabel>
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
                  This is the number of filled bottles you are returning.
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
                <FormLabel>Remaining Caps</FormLabel>
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
                  This is the number of remaining caps you are returning.
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
    </div>
  );
};
