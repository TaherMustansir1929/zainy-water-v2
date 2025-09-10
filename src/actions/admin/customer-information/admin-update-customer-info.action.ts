"use server";

import { db } from "@/db";
import { Customer, TotalBottles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type UpdateCustomerInfoDataProp = {
  id: string;
  data: typeof Customer.$inferInsert;
};

export async function updateCustomerInfo(data: UpdateCustomerInfoDataProp) {
  try {
    const [customer_info] = await db
      .select()
      .from(Customer)
      .where(eq(Customer.id, data.id));

    const [total_bottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt))
      .limit(1);

    const bottle_difference = data.data.bottles - customer_info.bottles;
    const deposit_difference = data.data.deposit - customer_info.deposit;

    const new_available_bottles =
      total_bottles.available_bottles - bottle_difference - deposit_difference;
    const new_used_bottles = total_bottles.used_bottles + bottle_difference;
    const new_deposit_bottles =
      total_bottles.deposit_bottles + deposit_difference;

    if (
      new_deposit_bottles > new_available_bottles ||
      total_bottles.total_bottles >= new_available_bottles + new_used_bottles ||
      new_available_bottles < 0 ||
      new_used_bottles < 0
    ) {
      throw new Error("Cannot update customer: Not enough available bottles.");
    }

    await Promise.all([
      await db
        .update(Customer)
        .set({ ...data.data, customer_id: data.data.customer_id.toLowerCase() })
        .where(eq(Customer.id, data.id)),

      await db
        .update(TotalBottles)
        .set({
          total_bottles: total_bottles.total_bottles - deposit_difference,
          available_bottles: new_available_bottles,
          used_bottles: new_used_bottles,
          deposit_bottles: new_deposit_bottles,
        })
        .where(eq(TotalBottles.id, total_bottles.id)),
    ]);
  } catch (error) {
    console.error("Error updating customer information:", error);
    throw error;
  }
}
