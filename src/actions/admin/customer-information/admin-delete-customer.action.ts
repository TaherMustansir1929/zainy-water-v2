"use server";

import { db } from "@/db";
import { Customer } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteCustomerById(id: string) {
  try {
    await db.delete(Customer).where(eq(Customer.id, id));
  } catch (error) {
    console.error("Error deleting customer");
    throw error;
  }
}
