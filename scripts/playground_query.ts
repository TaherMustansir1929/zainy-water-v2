"use server";

import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { and, eq } from "drizzle-orm";

async function main() {
  const [bottleUsage] = await db
    .select()
    .from(BottleUsage)
    .where(
      and(
        eq(BottleUsage.filled_bottles, 94),
        eq(BottleUsage.returned_bottles, 93),
        eq(BottleUsage.sales, 98)
      )
    );

  console.log(bottleUsage);

  await db
    .update(BottleUsage)
    .set({
      createdAt: new Date("2025-10-19"),
    })
    .where(eq(BottleUsage.id, bottleUsage.id));
}

await main();
