"use server";

import { db } from "@/db";
import { Customer } from "@/db/schema";
import { desc } from "drizzle-orm";

export interface GetAllCustomersRecords {
  Customer: typeof Customer.$inferSelect;
}

export async function fetchAllCustomers(): Promise<GetAllCustomersRecords[]> {
  try {
    const customers = await db.select().from(Customer).orderBy(desc(Customer.createdAt))

    return customers.map((customer) => ({
      Customer: customer,
    }));

  } catch (error) {
    console.error("Error fetching all customers: ", { error });
    throw error;
  }
}
