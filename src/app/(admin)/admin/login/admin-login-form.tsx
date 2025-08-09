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
import { useState } from "react";
import { loginAdmin } from "@/actions/admin/admin-login.action";
import { toast } from "sonner";
import { useAdminStore } from "@/lib/admin-state";
import { redirect } from "next/navigation";
import { LoadingDotsPulse } from "@/components/loading-dots";

const formSchema = z.object({
  name: z.string().min(2),
  password: z.string().min(4),
});

export const AdminLoginForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  // 2. FORM submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    const { success, message, admin_data } = await loginAdmin(
      values.name,
      values.password
    );
    setSubmitting(false);

    if (!success || !admin_data) {
      form.setError("name", { message });
      form.setError("password", { message });
      toast.error(message);
      return;
    }

    const { setAdmin } = useAdminStore.getState();

    setAdmin({
      id: admin_data.id,
      name: admin_data.name,
    });

    toast.success(message);
    redirect("/admin");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end">
          <Button type="submit" disabled={submitting}>
            Login
            {submitting && <LoadingDotsPulse size="sm" />}
          </Button>
        </div>
      </form>
    </Form>
  );
};
