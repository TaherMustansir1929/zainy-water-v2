"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useModeratorStore } from "@/lib/moderator-state";
import {
  createOtherExpense,
  OtherExpenseData,
} from "@/actions/moderator/mod-other-exp.action";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, SendHorizonal } from "lucide-react";

const formSchema = z.object({
  amount: z.number().min(1),
  description: z.string().min(1).max(250),
});

export function OtherExpenseForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const { moderator } = useModeratorStore();

  const [submitting, setSubmitting] = useState(false);

  // FORM submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);

    const data: OtherExpenseData = {
      moderator_id: moderator!.id,
      amount: values.amount,
      description: values.description,
      date: new Date(),
    };
    console.log(data);

    // Call the action to create the other expense
    const expense = await createOtherExpense(data);

    setSubmitting(false);

    if (expense) {
      console.log("Expense created successfully:", expense);
      form.reset(); // Reset the form after successful submission
      toast.success("Expense created successfully!");
    } else {
      console.error("Failed to create expense");
      alert("Failed to create expense. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Amount"
                  type="number"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Convert to number or null if empty
                    field.onChange(value ? parseFloat(value) : null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description" {...field} />
              </FormControl>
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
  );
}
