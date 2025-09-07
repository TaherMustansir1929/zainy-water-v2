"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  addDailyDeliveryRecord,
  DeliveryRecord,
} from "@/actions/moderator/deliveries/mod-delivery.action";
import { getCustomerByArea } from "@/actions/moderator/deliveries/mod-get-customer-by-area.action";
import { sendWhatsAppMessage } from "@/actions/moderator/deliveries/mod-whatsapp-automation";
import { BottleInput } from "@/components/bottle-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Customer } from "@/db/schema";
import { useModeratorStore } from "@/lib/moderator-state";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2,
  SendHorizonal,
} from "lucide-react";
import { toast } from "sonner";

// FORM SCHEMA
const formSchema = z
  .object({
    customer_id: z.string().min(2).max(50),
    filled_bottles: z.number().min(0),
    empty_bottles: z.number().min(0),
    foc: z.number().min(0),
    damaged_bottles: z.number().min(0),
    payment: z.number().min(0),
  })
  .refine((data) => data.foc <= data.filled_bottles, {
    message: "FOC bottles cannot exceed filled bottles",
    path: ["foc"],
  })
  .refine((data) => data.damaged_bottles <= data.empty_bottles, {
    message: "Damaged bottles cannot exceed empty bottles",
    path: ["damaged_bottles"],
  });

// MAIN COMPONENT
export const DailyDeliveryForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      filled_bottles: 0,
      empty_bottles: 0,
      foc: 0,
      damaged_bottles: 0,
      payment: 0,
    },
  });

  // STATES
  const [customerData, setCustomerData] = useState<
    typeof Customer.$inferSelect | null
  >(null);
  const moderator = useModeratorStore((state) => state.moderator);

  // Calculate balances based on payment flow
  const calculateBalances = () => {
    if (!customerData) {
      return {
        previous_balance: 0,
        current_balance: 0,
        advance_payment: 0,
      };
    }

    const filled_bottles = form.watch("filled_bottles") || 0;
    const payment = form.watch("payment") || 0;
    const foc = form.watch("foc") || 0;

    // Previous balance from database (positive = customer owes, negative = customer has advance)
    const db_previous_balance = customerData.balance;

    // Today's bill after FOC discount
    const raw_current_balance = customerData.bottle_price * filled_bottles;
    const foc_discount = customerData.bottle_price * foc;
    const todays_final_bill = Math.max(0, raw_current_balance - foc_discount);

    // Calculate total balance before payment (previous + today's bill)
    const total_balance_before_payment =
      db_previous_balance + todays_final_bill;

    // Apply payment to the total balance
    const balance_after_payment = total_balance_before_payment - payment;

    // Calculate display values
    let previous_balance = 0; // Total remaining balance (only positive values)
    let advance_payment = 0; // Advance amount (only when customer has overpaid)
    let current_balance = 0; // Remaining current balance after payment

    if (balance_after_payment > 0) {
      // Customer still owes money
      previous_balance = balance_after_payment;

      // Calculate how much of today's bill remains unpaid
      if (payment >= todays_final_bill) {
        // Payment covers today's bill completely
        current_balance = 0;
      } else {
        // Payment partially covers today's bill
        current_balance =
          todays_final_bill - Math.min(payment, todays_final_bill);
      }
    } else {
      // Customer has overpaid (advance payment scenario)
      previous_balance = 0;
      current_balance = 0;
      advance_payment = Math.abs(balance_after_payment);
    }

    return {
      previous_balance,
      current_balance,
      advance_payment,
    };
  };

  const { previous_balance, current_balance, advance_payment } =
    calculateBalances();

  const [submitting, setSubmitting] = useState(false);

  // FORM SUBMISSION HANDLER
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);

    // Check if customer data is available
    if (!customerData) {
      alert("Please search for a customer first.");
      setSubmitting(false);
      return;
    }

    // Error Handling/Form Validation for empty_bottles
    if (customerData && form.watch("empty_bottles") > customerData.bottles) {
      form.setError(
        "empty_bottles",
        {
          message:
            "Empty bottles cannot be more than customer's remaining bottles.",
        },
        { shouldFocus: true }
      );
      setSubmitting(false);
      return;
    }

    // Calculate final balance for submission
    const raw_current_balance =
      customerData.bottle_price * values.filled_bottles;
    const foc_discount = customerData.bottle_price * values.foc;
    const final_current_balance_before_payment = Math.max(
      0,
      raw_current_balance - foc_discount
    );
    const payment = values.payment || 0;
    const db_previous_balance = customerData.balance;

    let remaining_payment = payment;
    let final_current_balance = final_current_balance_before_payment;
    let final_previous_balance = db_previous_balance;

    // Apply payment logic
    if (remaining_payment > 0 && final_current_balance > 0) {
      const deduction = Math.min(remaining_payment, final_current_balance);
      final_current_balance -= deduction;
      remaining_payment -= deduction;
    }

    if (remaining_payment > 0 && final_previous_balance > 0) {
      const deduction = Math.min(remaining_payment, final_previous_balance);
      final_previous_balance -= deduction;
      remaining_payment -= deduction;
    }

    // Calculate final balance (negative means customer has advance)
    let balance = final_previous_balance + final_current_balance;
    if (remaining_payment > 0) {
      balance = -(
        remaining_payment +
        (db_previous_balance < 0 ? Math.abs(db_previous_balance) : 0)
      );
    }

    // Prepare data to be submitted
    const data: DeliveryRecord = {
      payment: values.payment || 0,
      balance,
      delivery_date: new Date(),
      moderator_id: moderator!.id,
      customer_id: customerData.customer_id,
      filled_bottles: values.filled_bottles,
      empty_bottles: values.empty_bottles,
      foc: values.foc,
      damaged_bottles: values.damaged_bottles,
      customer_bottles:
        customerData.bottles + values.filled_bottles - values.empty_bottles,
    };
    console.log({ data });

    try {
      const deliveryRecord = await addDailyDeliveryRecord(data);

      if (deliveryRecord.success) {
        // Send WhatsApp message as a server action
        const wa_customer_invoice = `*🧑‍💼 CUSTOMER DETAILS*
ID: *${customerData.customer_id}*
Name: *${customerData.name}*
Phone: *${customerData.phone}*
Bottle Price: *${customerData.bottle_price}/-*
Empty Bottles Remaining: *${data.customer_bottles}*

*💧 BOTTLE DETAILS*
Filled Bottles: *${data.filled_bottles}*
Empty Bottles: *${data.empty_bottles}*
${data.damaged_bottles ? `Damaged Bottles: *${data.damaged_bottles}*` : ""}
${data.foc ? `FOC Bottles: *${data.foc}*` : ""}

*💰 BALANCE SUMMARY*
${data.foc ? `FOC Discount: *${data.foc * customerData.bottle_price}/-*` : ""}
Today's Bill: *${Math.max(0, data.filled_bottles * customerData.bottle_price - data.foc * customerData.bottle_price)}/-*
Payment Received: *${payment}/-*
Total Remaining Balance: *${previous_balance}/-*
Advance Amount: *${advance_payment}/-*`;

        try {
          const whatsappResult = await sendWhatsAppMessage(
            customerData.phone,
            wa_customer_invoice,
            false
          );
          if (!whatsappResult.success) {
            console.warn("WhatsApp message failed:", whatsappResult.message);
            toast.error(
              "Delivery recorded but WhatsApp message failed to send"
            );
          } else {
            toast.success("Delivery recorded and WhatsApp message sent!");
          }
        } catch (whatsappError) {
          console.warn("WhatsApp message error:", whatsappError);
          toast.error("Delivery recorded but WhatsApp message failed to send");
        }

        form.reset();
        setCustomerData(null);
      } else {
        console.error(deliveryRecord.error);
        alert("Server Error: Failed to add delivery record. Please try again.");
        toast.error(deliveryRecord.error);
      }
    } catch (error) {
      console.error("Error adding delivery record:", error);
      alert("Failed to add delivery record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // const handleCustomerSearch = async () => {
  //   setLoading(true);
  //   const data = await getCustomerDataById(
  //     form.getValues("customer_id"),
  //     moderator?.areas || []
  //   );
  //   setLoading(false);

  //   if (data.success) {
  //     setCustomerData(data.data);
  //     toast.success("Customer found successfully!");
  //   } else {
  //     setCustomerData(null);
  //     alert(data.error);
  //   }
  // };

  const [openAreaBox, setOpenAreaBox] = useState(false);
  const [modArea, setModArea] = useState<
    (typeof Customer.$inferSelect)["area"] | null
  >();

  const [openCombobox, setOpenCombobox] = useState(false);
  const [customerList, setCustomerList] = useState<
    (typeof Customer.$inferSelect)[]
  >([]);
  const [fetchingCustomerList, setFetchingCustomerList] = useState(false);

  useEffect(() => {
    if (modArea) {
      const fetchCustomers = async () => {
        setFetchingCustomerList(true);
        const customers = await getCustomerByArea(modArea);
        setCustomerList(customers);
        setFetchingCustomerList(false);
        console.log("Fetched customer list for: ", modArea);
      };
      try {
        fetchCustomers();
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    }
  }, [modArea]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* CUSTOMER ID */}
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* <div>
                      <FormLabel className="flex items-center gap-2 mb-2">
                        Select Area
                        {fetchingCustomerList && (
                          <Loader2 className="animate-spin size-4" />
                        )}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setModArea(
                            value as (typeof Customer.$inferSelect)["area"]
                          );
                          setCustomerData(null);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Area" />
                        </SelectTrigger>
                        <SelectContent>
                          {moderator?.areas.map((area) => (
                            <SelectItem value={area} key={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}
                    <div className="w-full">
                      <FormLabel className="flex items-center gap-2 mb-2">
                        Select Area
                        {fetchingCustomerList && (
                          <Loader2 className="animate-spin size-4 ml-2" />
                        )}
                      </FormLabel>
                      <Popover open={openAreaBox} onOpenChange={setOpenAreaBox}>
                        <PopoverTrigger asChild disabled={fetchingCustomerList}>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openAreaBox}
                            className="w-full justify-between"
                          >
                            {modArea ? (
                              <div className="flex items-center justify-between w-full">
                                <span>{modArea}</span>
                              </div>
                            ) : (
                              "Select..."
                            )}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search Area..." />
                            <CommandList>
                              <CommandEmpty>No Area found.</CommandEmpty>
                              <CommandGroup>
                                {moderator?.areas.map((area) => (
                                  <CommandItem
                                    key={area}
                                    value={area}
                                    onSelect={() => {
                                      field.onChange(area);
                                      setModArea(area);
                                      setOpenAreaBox(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        modArea === area
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span>{area}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="w-full">
                      <FormLabel className="flex items-center gap-2 mb-2">
                        Select Customer
                        {fetchingCustomerList && (
                          <Loader2 className="animate-spin size-4 ml-2" />
                        )}
                      </FormLabel>
                      <Popover
                        open={openCombobox}
                        onOpenChange={setOpenCombobox}
                      >
                        <PopoverTrigger
                          asChild
                          disabled={!modArea && fetchingCustomerList}
                        >
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between"
                          >
                            {customerData ? (
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {
                                    customerList.find(
                                      (customer) =>
                                        customer.id === customerData.id
                                    )?.name
                                  }
                                </span>
                                <span>
                                  {
                                    customerList.find(
                                      (customer) =>
                                        customer.id === customerData.id
                                    )?.customer_id
                                  }
                                </span>
                              </div>
                            ) : (
                              "Select..."
                            )}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search Customer..." />
                            <CommandList>
                              <CommandEmpty>No Customer found.</CommandEmpty>
                              <CommandGroup>
                                {customerList.map((customer) => (
                                  <CommandItem
                                    key={customer.id}
                                    value={customer.name}
                                    onSelect={() => {
                                      field.onChange(customer.id);
                                      setCustomerData(customer);
                                      setOpenCombobox(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        customerData?.id === customer.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                      <span>{customer.name}</span>
                                      <span>{customer.customer_id}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {customerData && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-bold">ID:</span>{" "}
                  {customerData.customer_id}
                </p>
                <p>
                  <span className="font-bold">Name:</span> {customerData.name}
                </p>
                <p>
                  <span className="font-bold">Phone:</span> {customerData.phone}
                </p>
                <p>
                  <span className="font-bold">Address:</span>{" "}
                  {customerData.address}
                </p>
                <p>
                  <span className="font-bold">Bottle Price:</span>{" "}
                  {customerData.bottle_price}/-
                </p>
                <p>
                  <span className="font-bold">Deposit:</span>{" "}
                  {customerData.deposit * customerData.deposit_price}
                  /-
                  <span className="font-mono text-muted-foreground">
                    {" "}
                    ({customerData.deposit} bottles)
                  </span>
                </p>
                <p>
                  <span className="font-bold">Empty Bottles Remaining:</span>{" "}
                  {customerData.bottles}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* FILLED BOTTLES */}
            <FormField
              control={form.control}
              name="filled_bottles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filled Bottles</FormLabel>
                  <FormControl>
                    <div className="*:not-first:mt-2">
                      <div className="relative">
                        {/* <Input
                          {...field}
                          className="peer ps-6 pe-12"
                          placeholder="00"
                          type="number"
                          onChange={(e) => {
                            const value = e.target.value;
                            // Convert to number or 0 if empty
                            field.onChange(value ? parseFloat(value) : 0);
                          }}
                        /> */}
                        <BottleInput
                          field={field}
                          onChange={field.onChange}
                          defaultValue={0}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMPTY BOTTLES */}
            <FormField
              control={form.control}
              name="empty_bottles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empty Bottles</FormLabel>
                  <FormControl>
                    <div className="*:not-first:mt-2">
                      <div className="relative">
                        <BottleInput
                          field={field}
                          onChange={field.onChange}
                          defaultValue={0}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* FOC BOTTLES */}
            <FormField
              control={form.control}
              name="foc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Free/Leak Bottles</FormLabel>
                  <FormControl>
                    <div className="*:not-first:mt-2">
                      <div className="relative">
                        <BottleInput
                          field={field}
                          onChange={field.onChange}
                          defaultValue={0}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMPTY BOTTLES */}
            <FormField
              control={form.control}
              name="damaged_bottles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damaged Bottles</FormLabel>
                  <FormControl>
                    <div className="*:not-first:mt-2">
                      <div className="relative">
                        <BottleInput
                          field={field}
                          onChange={field.onChange}
                          defaultValue={0}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* PAYMENT */}
          <FormField
            control={form.control}
            name="payment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment</FormLabel>
                <FormControl>
                  <div className="*:not-first:mt-2">
                    <div className="relative">
                      <Input
                        {...field}
                        className="peer ps-6 pe-12"
                        placeholder="00"
                        type="number"
                        onChange={(e) => {
                          const value = e.target.value;
                          // Convert to number or 0 if empty
                          field.onChange(value ? parseFloat(value) : 0);
                        }}
                      />
                      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
                        PKR
                      </span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {customerData && (
            <div className="space-y-2 border border-gray-200 p-4 rounded-xl shadow-md">
              <h1 className="text-xl font-bold underline">Balance Summary:</h1>

              {(form.watch("foc") || 0) > 0 && (
                <p className="w-full flex items-center justify-between">
                  <span className="font-bold">FOC Discount:</span>
                  <span>
                    -{(form.watch("foc") || 0) * customerData.bottle_price}/-
                  </span>
                </p>
              )}
              <p className="w-full flex items-center justify-between">
                <span className="font-bold">Today&apos;s Bill:</span>
                <span>
                  {Math.max(
                    0,
                    (form.watch("filled_bottles") || 0) *
                      customerData.bottle_price -
                      (form.watch("foc") || 0) * customerData.bottle_price
                  )}
                  /-
                </span>
              </p>
              <p className="w-full flex items-center justify-between">
                <span className="font-bold">Total Remaining Balance:</span>
                <span>{previous_balance}/-</span>
              </p>
              <div className="border-t pt-2 border-gray-500">
                <p className="w-full flex items-center justify-between">
                  <span className="font-bold">
                    Today&apos;s Bill (Before FOC):
                  </span>
                  <span>
                    {(form.watch("filled_bottles") || 0) *
                      customerData.bottle_price}
                    /-
                  </span>
                </p>
                {(form.watch("payment") || 0) > 0 && (
                  <p className="w-full flex items-center justify-between">
                    <span className="font-bold">Payment Received:</span>
                    <span>{form.watch("payment")}/-</span>
                  </p>
                )}
                <p className="w-full flex items-center justify-between">
                  <span className="font-bold">
                    Previous Balance:
                    {customerData.balance > 0 ? (
                      <span className="text-red-500 font-normal">
                        {" "}
                        (Customer Owes)
                      </span>
                    ) : customerData.balance < 0 ? (
                      <span className="text-green-500 font-normal">
                        {" "}
                        (Advance Paid)
                      </span>
                    ) : (
                      <span className="text-gray-500 font-normal">
                        0/- (Clear)
                      </span>
                    )}
                  </span>
                  <span>
                    {customerData.balance > 0
                      ? `${customerData.balance}/-`
                      : customerData.balance < 0
                        ? `${Math.abs(customerData.balance)}/-`
                        : "0/- (Clear)"}
                  </span>
                </p>
                <p className="w-full flex items-center justify-between">
                  <span className="font-bold">Remaining Current Balance:</span>
                  <span>{current_balance}/-</span>
                </p>
                <p className="w-full flex items-center justify-between">
                  <span className="font-bold">Advance Amount:</span>
                  <span>{advance_payment}/-</span>
                </p>
              </div>
            </div>
          )}

          <Button
            disabled={!customerData || submitting}
            type="submit"
            className="w-full bg-primary disabled:opacity-100 disabled:hover:cursor-not-allowed shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/50 font-bold"
          >
            Submit
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizonal className="size-4" />
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
