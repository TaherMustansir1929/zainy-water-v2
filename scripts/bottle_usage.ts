import { db } from "@/db";
import { BottleUsage, TotalBottles } from "@/db/schema";
import { desc } from "drizzle-orm";
async function main() {
  try {
    const filled_bottles = 100;

    const [total_bottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt));

    if (total_bottles.available_bottles < filled_bottles) {
      throw new Error("Filled_bottles cannot exceed total available bottles");
    }

    const bottleUsage = await db
      .insert(BottleUsage)
      .values({
        moderator_id: "mymexcwxzso394if0cb4e75e",
        filled_bottles: filled_bottles,
        returned_bottles: filled_bottles,
      })
      .returning();

    await db.update(TotalBottles).set({
      available_bottles: total_bottles.available_bottles - filled_bottles,
      used_bottles: total_bottles.used_bottles + filled_bottles,
    });

    console.log({ bottleUsage });
  } catch (error) {
    console.error("Error creating bottle usage:", error);
  }
}

await main();
