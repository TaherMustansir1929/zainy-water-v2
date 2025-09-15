"use server";

import { db } from "@/db";
import { Customer } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const customers = await db.select().from(Customer);

  let index = 0;

  await Promise.all(
    customers.map((customer) => {
      console.log(`Resetting customer ${++index}/${customers.length}`);
      return resetCustomer(customer.id);
    })
  );
}

async function resetCustomer(id: string) {
  await db.update(Customer).set({ bottles: 0 }).where(eq(Customer.id, id));
}

await main();
