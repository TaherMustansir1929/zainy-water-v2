"use server";

import { db } from "@/db";
import { Customer, TotalBottles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type CreateNewCustomerDataProp = {
  data: typeof Customer.$inferInsert;
};

export async function createNewCustomer(data: CreateNewCustomerDataProp) {
  try {
    const [total_bottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt))
      .limit(1);

    if (!total_bottles) {
      throw new Error(
        "Cannot create customer: TotalBottles entry does not exist."
      );
    }

    await db
      .update(TotalBottles)
      .set({
        total_bottles: total_bottles.total_bottles - data.data.deposit,
      })
      .where(eq(TotalBottles.id, total_bottles.id));

    await db.insert(Customer).values({
      ...data.data,
      customer_id: data.data.customer_id.toLowerCase(),
    });
  } catch (error) {
    console.error("Error creating new customer:", error);
    throw error;
  }
}
