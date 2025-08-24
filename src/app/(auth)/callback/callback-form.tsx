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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkLicenseKey } from "./license.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { ArrowUpFromDot, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { requestLicense } from "./request-license.action";
import { dev_emails } from "@/lib/utils";

const formSchema = z.object({
  license_key: z.string().min(2, {
    message: "License key must be at least 2 characters.",
  }),
});

export function CallbackForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      license_key: "",
    },
  });

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    try {
      const licenseResponse = await checkLicenseKey(values.license_key);
      if (licenseResponse.success) {
        console.log(licenseResponse.message);
        toast.success("Request successful. Please wait...");
        router.push("/admin");
      } else {
        toast.error("An Error Occurred");
        console.log(licenseResponse.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to validate license key. Try Again.");
    } finally {
      setSubmitting(false);
    }
  }

  const licenseMutation = useMutation<
    { success: boolean; message: string; redirect: boolean },
    Error,
    void
  >({
    mutationKey: ["request_license_mutation"],
    mutationFn: async () => {
      return await requestLicense();
    },
    onSuccess: (res) => {
      toast.success(res.message);
      if (res.redirect) {
        router.push("/admin");
      }
      setRequested(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to request license.");
      console.error("Failed to request license:", error);
    },
  });

  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return <>Loading...</>;
  }

  if (!isSignedIn) {
    toast.error("You are currently not signed-in.");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Enter developer liscense key</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="license_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Key</FormLabel>
                  <FormControl>
                    <Input placeholder="******" {...field} />
                  </FormControl>
                  <FormDescription>
                    Retrieve your developer liscense key by contacting the
                    developer of this website.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={"outline"}
                className="cursor-pointer flex-1"
                onClick={() => licenseMutation.mutate()}
                disabled={requested}
              >
                {licenseMutation.isPending ? (
                  <>
                    Requesting <Loader2 className="animate-spin size-4" />
                  </>
                ) : requested ? (
                  "Requested"
                ) : (
                  "Request License"
                )}
              </Button>

              <Button type="submit" className="cursor-pointer flex-1">
                {submitting ? (
                  <>
                    Submitting <Loader2 className="animate-spin size-4" />
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">
          {requested ? (
            <span>
              License request sent. Please contact the developer at{" "}
              <strong>{dev_emails[0]}</strong>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              {" "}
              <ArrowUpFromDot className="size-4" /> Request a license key first.
            </span>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}
