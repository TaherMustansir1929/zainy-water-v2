"use server";

import { db } from "@/db";
import { Customer } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCustomerByArea(
  area: (typeof Customer.$inferSelect)["area"]
): Promise<(typeof Customer.$inferSelect)[]> {
  try {
    const customers = await db
      .select()
      .from(Customer)
      .where(eq(Customer.area, area));
    return customers;
  } catch (error) {
    console.error("Error fetching customers by area:", error);
    throw new Error("Failed to fetch customers");
  }
}
