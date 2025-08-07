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
import { redirect } from "next/navigation";

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

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await changeAdminPasswordAndId(
      values.current_password,
      values.new_password
    );

    if (response.error) {
      toast.error(`Error: ${response.error}`);
      return;
    }

    await cookieStore.delete("admin_id"); // Clear admin cookie
    useAdminStore.getState().setAdmin(null); // Clear admin state after password change
    form.reset(); // Reset the form after successful submission
    toast.success("Password changed successfully! You will be logged out.");
    console.log(values);
    redirect("/admin/login");
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
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
