"use server";

import { db } from "@/db";
import { Miscellaneous } from "@/db/schema";
import { endOfDay, startOfDay } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function fetchMiscDeliveryByModId(
  id: string
): Promise<(typeof Miscellaneous.$inferSelect)[] | null> {
  // Try to get cached misc delivery data first
  const today = new Date().toDateString();
  const cacheKey = `misc-delivery-${id}-${today}`;
  const cachedMiscDelivery = await redis.getValue(
    "temp",
    "miscellaneous",
    cacheKey
  );

  if (cachedMiscDelivery.success && cachedMiscDelivery.data) {
    // Convert date strings back to Date objects
    const deliveries = cachedMiscDelivery.data as (Omit<
      typeof Miscellaneous.$inferSelect,
      "createdAt" | "updatedAt"
    > & {
      createdAt: string;
      updatedAt: string;
    })[];

    return deliveries.map((delivery) => ({
      ...delivery,
      createdAt: new Date(delivery.createdAt),
      updatedAt: new Date(delivery.updatedAt),
    }));
  }

  // If cache miss, fetch from database
  const miscDelivery = await db
    .select()
    .from(Miscellaneous)
    .where(
      and(
        eq(Miscellaneous.moderator_id, id),
        gte(Miscellaneous.createdAt, startOfDay(new Date())),
        lte(Miscellaneous.createdAt, endOfDay(new Date()))
      )
    )
    .orderBy(desc(Miscellaneous.createdAt));

  if (miscDelivery.length > 0) {
    // Convert Date objects to strings for caching
    const cacheable = miscDelivery.map((delivery) => ({
      ...delivery,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
    }));

    // Cache with temp TTL since it's daily data that changes frequently
    await redis.setValue("temp", "miscellaneous", cacheKey, cacheable);
  }

  return miscDelivery.length > 0 ? miscDelivery : null;
}
