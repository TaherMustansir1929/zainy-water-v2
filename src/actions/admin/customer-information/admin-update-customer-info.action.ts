"use server";

import { db } from "@/db";
import { Customer } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UpdateCustomerInfoDataProp = {
  id: string;
  data: typeof Customer.$inferInsert;
};

export async function updateCustomerInfo(data: UpdateCustomerInfoDataProp) {
  try {
    await db.update(Customer).set(data.data).where(eq(Customer.id, data.id));
  } catch (error) {
    console.error("Error updating customer information:", error);
    throw error;
  }
}
