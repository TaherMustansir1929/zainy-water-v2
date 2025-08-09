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
import { changeAdminPasswordAndId } from "@/actions/admin/admin-change-password.action";
import { toast } from "sonner";
import { useAdminStore } from "@/lib/admin-state";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingDotsPulse } from "@/components/loading-dots";

const formSchema = z
  .object({
    current_password: z.string().min(4),
    new_password: z.string().min(4),
    confirm_password: z.string().min(4),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const AdminChangePasswordForm = () => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    const response = await changeAdminPasswordAndId(
      values.current_password,
      values.new_password
    );
    setSubmitting(false);

    if (response.error) {
      toast.error(`Error: ${response.error}`);
      return;
    }

    // Update localStorage (zustand persisted store) with new admin data
    if (response.admin) {
      useAdminStore
        .getState()
        .setAdmin({ id: response.admin.id, name: response.admin.name });
    }

    form.reset();
    toast.success("Password and ID updated. Session refreshed.");
    // Ensure app reads latest cookie on server components
    router.refresh();
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your current password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="Confirm your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <div className="flex items-center gap-2">
                  Updating <LoadingDotsPulse size="sm" />
                </div>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
