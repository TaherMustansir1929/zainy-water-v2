"use server";

import { db } from "@/db";
import { BottleUsage, TotalBottles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

type DataProps = {
  moderator_id: string;
  empty_bottles: number;
  remaining_bottles: number;
  caps: number;
};

export async function returnBottleUsage(data: DataProps) {
  const [bottleUsage] = await db
    .select()
    .from(BottleUsage)
    .where(eq(BottleUsage.moderator_id, data.moderator_id))
    .orderBy(desc(BottleUsage.createdAt))
    .limit(1);

  if (!bottleUsage) {
    throw new Error("Bottle usage not found");
  }

  if (
    bottleUsage.empty_bottles < data.empty_bottles ||
    bottleUsage.remaining_bottles < data.remaining_bottles
  ) {
    throw new Error("Insufficient bottles to return");
  }

  if (bottleUsage.caps < data.caps) {
    throw new Error("Insufficient caps to return");
  }

  const [totalBottles] = await db
    .select()
    .from(TotalBottles)
    .orderBy(desc(TotalBottles.createdAt))
    .limit(1);

  if (!totalBottles) {
    throw new Error("Total bottles record not found");
  }

  await db
    .update(TotalBottles)
    .set({
      available_bottles:
        totalBottles.available_bottles +
        data.empty_bottles +
        data.remaining_bottles,
      used_bottles:
        totalBottles.used_bottles - data.empty_bottles - data.remaining_bottles,
    })
    .where(eq(TotalBottles.id, totalBottles.id));

  await db
    .update(BottleUsage)
    .set({
      empty_bottles: bottleUsage.empty_bottles - data.empty_bottles,
      remaining_bottles: bottleUsage.remaining_bottles - data.remaining_bottles,
      returned_bottles:
        bottleUsage.returned_bottles +
        data.remaining_bottles +
        data.empty_bottles,
      caps: bottleUsage.caps - data.caps,
    })
    .where(eq(BottleUsage.id, bottleUsage.id));

  // Invalidate relevant caches after bottle usage return
  await redis.deleteValue(
    "temp",
    "bottle_usage",
    `bottle-usage-${data.moderator_id}`
  );
  await redis.deleteValue("cache", "total_bottles", "latest");
}
