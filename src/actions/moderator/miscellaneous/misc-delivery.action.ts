"use server";

import { db } from "@/db";
import { BottleUsage, Miscellaneous, Moderator } from "@/db/schema";
import { endOfDay, startOfDay } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export type MiscDeliveryProps = {
  moderator_id: string;
  customer_name: string;
  description: string;
  filled_bottles: number;
  empty_bottles: number;
  damaged_bottles: number;
  isPaid: boolean;
  payment: number;
};

export async function addMiscDelivery(data: MiscDeliveryProps) {
  const [moderator] = await db
    .select()
    .from(Moderator)
    .where(eq(Moderator.id, data.moderator_id))
    .limit(1);

  if (!moderator) {
    throw new Error("Moderator not found");
  }

  const [bottleUsage] = await db
    .select()
    .from(BottleUsage)
    .where(
      and(
        eq(BottleUsage.moderator_id, data.moderator_id),
        gte(BottleUsage.createdAt, startOfDay(new Date())),
        lte(BottleUsage.createdAt, endOfDay(new Date()))
      )
    )
    .orderBy(desc(BottleUsage.createdAt))
    .limit(1);

  if (!bottleUsage) {
    throw new Error("Bottle usage not found");
  }

  if (bottleUsage.remaining_bottles < data.filled_bottles) {
    throw new Error("Not enough remaining bottles");
  }

  // Proceed with adding the miscellaneous delivery
  await db.insert(Miscellaneous).values({
    ...data,
  });

  await db
    .update(BottleUsage)
    .set({
      sales: bottleUsage.sales + data.filled_bottles,
      remaining_bottles: bottleUsage.remaining_bottles - data.filled_bottles,
      empty_bottles: bottleUsage.empty_bottles + data.empty_bottles,
    })
    .where(eq(BottleUsage.id, bottleUsage.id));

  // Invalidate relevant caches after adding misc delivery
  const today = new Date().toDateString();
  const cacheKey = `misc-delivery-${data.moderator_id}-${today}`;
  await redis.deleteValue("temp", "miscellaneous", cacheKey);
  await redis.deleteValue(
    "temp",
    "bottle_usage",
    `bottle-usage-${data.moderator_id}`
  );
}
