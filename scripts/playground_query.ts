"use server";

import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const bottleUsages = await db.select().from(BottleUsage);
  await Promise.all([
    bottleUsages.map(async (bu) => {
      if (bu.returned_bottles % 2 == 0) {
        await db
          .update(BottleUsage)
          .set({
            empty_returned: bu.returned_bottles / 2,
            remaining_returned: bu.returned_bottles / 2,
          })
          .where(eq(BottleUsage.id, bu.id));
      } else {
        await db
          .update(BottleUsage)
          .set({
            empty_returned: (bu.returned_bottles - 1) / 2 + 1,
            remaining_returned: (bu.returned_bottles - 1) / 2,
          })
          .where(eq(BottleUsage.id, bu.id));
      }
      console.log(`Updated BottleUsage ID: ${bu.id}`);
    }),
  ]);
}

await main();
