"use server";

import { db } from "@/db";
import { Customer } from "@/db/schema";

export type CreateNewCustomerDataProp = {
  data: typeof Customer.$inferInsert;
};

export async function createNewCustomer(data: CreateNewCustomerDataProp) {
  try {
    await db.insert(Customer).values(data.data);
  } catch (error) {
    console.error("Error creating new customer:", error);
    throw error;
  }
}
