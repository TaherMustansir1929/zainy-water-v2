import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import * as React from "react";
import { columnSchema } from "@/modules/admin/deliveries/ui/data-table-4-misc-deliveries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  customer_name: z.string().min(2),
  filled_bottles: z.number().min(0),
  empty_bottles: z.number().min(0),
  damaged_bottles: z.number().min(0),
  isPaid: z.boolean(),
  payment: z.number().min(0),
  description: z.string().min(2),
});

export function MiscellaneousTableCellViewer({ item }: { item: columnSchema }) {
  const isMobile = useIsMobile();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: item.Miscellaneous.customer_name || "",
      description: item.Miscellaneous.description || "",
      filled_bottles: item.Miscellaneous.filled_bottles || 0,
      empty_bottles: item.Miscellaneous.empty_bottles || 0,
      damaged_bottles: item.Miscellaneous.damaged_bottles || 0,
      isPaid: item.Miscellaneous.isPaid || false,
      payment: item.Miscellaneous.payment || 0,
    },
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  const updateMutation = useMutation(
    orpc.admin.deliveries.updateMiscDelivery.mutationOptions({
      onSuccess: async () => {
        toast.success("Delivery updated successfully");
        // Invalidate and refetch
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.util.get30dMiscDeliveries.queryKey(),
          }),
        ]);
        router.refresh();
      },
    })
  );

  const button_disabled =
    form.watch("filled_bottles") === item.Miscellaneous.filled_bottles &&
    form.watch("empty_bottles") === item.Miscellaneous.empty_bottles &&
    form.watch("damaged_bottles") === item.Miscellaneous.damaged_bottles &&
    form.watch("isPaid") === item.Miscellaneous.isPaid &&
    form.watch("payment") === item.Miscellaneous.payment &&
    form.watch("description") === item.Miscellaneous.description &&
    updateMutation.isPending;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.isPaid && values.payment > 0) {
      toast.error(
        "Please set isPaid to true if the customer paid for the delivery"
      );
      return;
    } else if (values.isPaid && values.payment === 0) {
      toast.error(
        "Please set isPaid to false if the customer did not pay for the delivery"
      );
      return;
    }

    const result = await updateMutation.mutateAsync({
      Miscellaneous: item.Miscellaneous,
      Moderator: item.Moderator,
      data: { ...values },
    });
    console.log({ result });
    form.reset(values); // Reset the form with the new values
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className={cn(
            "text-foreground w-fit px-0 text-left cursor-pointer",
            isMobile && "underline underline-offset-4 font-bold"
          )}
        >
          {item.Miscellaneous.customer_name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {item.Moderator.name} {"->"} {item.Miscellaneous.customer_name}
          </DrawerTitle>
          <DrawerDescription>
            <div>
              Showing details of delivery for {item.Miscellaneous.customer_name}
            </div>
            <div>By: {item.Moderator.name}</div>
            <div>Date: {format(item.Miscellaneous.createdAt, "PPP")}</div>
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <Card className="w-full">
            <CardHeader>
              <h2 className="text-lg font-semibold">Delivery Details</h2>
            </CardHeader>
            <CardContent className="p-0">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <ul className="divide-y divide-border">
                    {startOfDay(item.Miscellaneous.createdAt) <
                    startOfDay(new Date()) ? (
                      <>
                        {Object.entries(item.Miscellaneous).map(
                          ([key, value], index) => {
                            if (
                              [
                                "id",
                                "moderator_id",
                                "createdAt",
                                "updatedAt",
                              ].includes(key)
                            ) {
                              return null;
                            }
                            return (
                              <li
                                key={index}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                              >
                                <span className="text-sm font-medium text-muted-foreground capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm font-semibold">
                                  {value.toString()}
                                </span>
                              </li>
                            );
                          }
                        )}
                      </>
                    ) : (
                      <>
                        <li>
                          <FormField
                            control={form.control}
                            name={"customer_name"}
                            render={({ field }) => (
                              <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                                <FormLabel>Customer Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="customer_name"
                                    {...field}
                                    className={"max-w-[150px]"}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </li>
                        <li>
                          <FormField
                            control={form.control}
                            name={"description"}
                            render={({ field }) => (
                              <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="description"
                                    className={"max-w-[150px]"}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </li>
                        {Object.entries(item.Miscellaneous).map(([key]) => {
                          if (
                            [
                              "id",
                              "customer_name",
                              "description",
                              "moderator_id",
                              "createdAt",
                              "updatedAt",
                            ].includes(key)
                          ) {
                            return null;
                          }
                          if (key === "isPaid") {
                            return (
                              <li key={key}>
                                <FormField
                                  control={form.control}
                                  name={"isPaid"}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                                      <FormLabel className={"capitalize"}>
                                        {key.replace(/_/g, " ")}
                                      </FormLabel>
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          aria-readonly
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </li>
                            );
                          }
                          return (
                            <li key={key}>
                              <FormField
                                control={form.control}
                                name={key as keyof z.infer<typeof formSchema>}
                                render={({ field }) => (
                                  <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                                    <FormLabel className={"capitalize"}>
                                      {key.replace(/_/g, " ")}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type={"number"}
                                        // @ts-expect-error remove field.value type error
                                        value={field.value}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          // Convert to number or 0 if empty
                                          field.onChange(
                                            value ? parseFloat(value) : 0
                                          );
                                        }}
                                        className={"max-w-[100px]"}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </li>
                          );
                        })}
                      </>
                    )}
                  </ul>
                  {startOfDay(item.Miscellaneous.createdAt) >=
                    startOfDay(new Date()) && (
                    <div
                      className={"w-full flex justify-center items-start px-4"}
                    >
                      <Button
                        type={"submit"}
                        className={"min-w-[150px]"}
                        disabled={button_disabled}
                      >
                        {updateMutation.isPending ? (
                          <>
                            Saving
                            <Loader2 className={"animate-spin"} />
                          </>
                        ) : (
                          <>Save</>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
