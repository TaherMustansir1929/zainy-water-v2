"use server";

import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function fetchModeratorBottleUsage(
  id: string
): Promise<typeof BottleUsage.$inferSelect | null> {
  try {
    // Try to get cached bottle usage first
    const cacheKey = `bottle-usage-${id}`;
    const cachedUsage = await redis.getValue("cache", "bottle_usage", cacheKey);

    if (cachedUsage.success && cachedUsage.data) {
      // Convert date string back to Date object
      const usage = cachedUsage.data as Omit<
        typeof BottleUsage.$inferSelect,
        "createdAt" | "updatedAt"
      > & {
        createdAt: string;
        updatedAt: string;
      };
      return {
        ...usage,
        createdAt: new Date(usage.createdAt),
        updatedAt: new Date(usage.updatedAt),
      };
    }

    // If cache miss, fetch from database
    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(eq(BottleUsage.moderator_id, id))
      .orderBy(desc(BottleUsage.createdAt))
      .limit(1);

    if (bottleUsage) {
      // Convert Date objects to strings for caching
      const cacheable = {
        ...bottleUsage,
        createdAt: bottleUsage.createdAt.toISOString(),
        updatedAt: bottleUsage.updatedAt.toISOString(),
      };

      // Cache with short TTL since bottle usage changes frequently
      await redis.setValue("temp", "bottle_usage", cacheKey, cacheable);
    }

    return bottleUsage ?? null;
  } catch (error) {
    console.error("Error fetching bottle usage:", error);
    return null;
  }
}
