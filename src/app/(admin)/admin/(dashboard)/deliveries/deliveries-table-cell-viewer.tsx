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
import { columnSchema } from "@/app/(admin)/admin/(dashboard)/deliveries/data-table-3-daily-deliveries";
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
import { useUpdateDailyDeliveryRecord } from "@/queries/admin/useUpdateDailyDeliveryRecord";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  payment: z.number().min(0),
  filled_bottles: z.number().min(0),
  empty_bottles: z.number().min(0),
  foc: z.number().min(0),
  damaged_bottles: z.number().min(0),
});

export function DeliveriesTableCellViewer({ item }: { item: columnSchema }) {
  const isMobile = useIsMobile();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment: item.Delivery.payment || 0,
      filled_bottles: item.Delivery.filled_bottles || 0,
      empty_bottles: item.Delivery.empty_bottles || 0,
      foc: item.Delivery.foc || 0,
      damaged_bottles: item.Delivery.damaged_bottles || 0,
    },
  });

  const updateMutation = useUpdateDailyDeliveryRecord();

  const button_disabled =
    form.watch("filled_bottles") === item.Delivery.filled_bottles &&
    form.watch("empty_bottles") === item.Delivery.empty_bottles &&
    form.watch("payment") === item.Delivery.payment &&
    form.watch("foc") === item.Delivery.foc &&
    form.watch("damaged_bottles") === item.Delivery.damaged_bottles &&
    updateMutation.isPending;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await updateMutation.mutateAsync({
      Delivery: item.Delivery,
      Customer: item.Customer,
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
            isMobile && "underline underline-offset-4 font-bold",
          )}
        >
          {item.Customer.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {item.Moderator.name} {"->"} {item.Customer.name}
          </DrawerTitle>
          <DrawerDescription>
            <div>Showing details of delivery for {item.Customer.name}</div>
            <div>By: {item.Moderator.name}</div>
            <div>Date: {format(item.Delivery.createdAt, "PPP")}</div>
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
                    {Object.entries(item.Delivery).map(
                      ([key, value], index) => {
                        if (
                          [
                            "id",
                            "moderator_id",
                            "createdAt",
                            "updatedAt",
                            "customer_id",
                            "delivery_date",
                          ].includes(key)
                        ) {
                          return null;
                        }
                        return (
                          <li
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                          >
                            {startOfDay(item.Delivery.createdAt) <
                            startOfDay(new Date()) ? (
                              <>
                                <span className="text-sm font-medium text-muted-foreground capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm font-semibold">
                                  {value.toString()}
                                </span>
                              </>
                            ) : (
                              <FormField
                                control={form.control}
                                name={key as keyof z.infer<typeof formSchema>}
                                render={({ field }) => (
                                  <FormItem
                                    className={
                                      "w-full flex flex-row items-center justify-between"
                                    }
                                  >
                                    <FormLabel className={"capitalize"}>
                                      {key.replace(/_/g, " ")}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type={"number"}
                                        value={field.value}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          // Convert to number or 0 if empty
                                          field.onChange(
                                            value ? parseFloat(value) : 0,
                                          );
                                        }}
                                        className={"max-w-[100px]"}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </li>
                        );
                      },
                    )}
                  </ul>
                  {startOfDay(item.Delivery.createdAt) >=
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

          <Card className="w-full">
            <CardHeader>
              <h2 className="text-lg font-semibold">Customer Details</h2>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {Object.entries(item.Customer).map(([key, value], index) => {
                  if (["id", "createdAt", "updatedAt"].includes(key)) {
                    return null;
                  }
                  return (
                    <li
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-muted-foreground capitalize">
                        {key === "balance" && Number(value) < 0
                          ? "advance"
                          : key.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-semibold ">
                        {key === "balance" && Number(value) < 0
                          ? Math.abs(Number(value)).toString()
                          : value.toString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
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
