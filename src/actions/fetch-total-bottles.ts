"use server";

import { db } from "@/db";
import { TotalBottles } from "@/db/schema";
import { desc } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function fetchTotalBottles(): Promise<
  | {
      success: true;
      totalBottles: typeof TotalBottles.$inferSelect;
    }
  | { success: false; error: unknown }
> {
  try {
    // Try to get cached total bottles first
    const cachedTotalBottles = await redis.getValue(
      "cache",
      "total_bottles",
      "latest"
    );

    if (cachedTotalBottles.success && cachedTotalBottles.data) {
      // Convert date strings back to Date objects
      const bottles = cachedTotalBottles.data as Omit<
        typeof TotalBottles.$inferSelect,
        "createdAt" | "updatedAt"
      > & {
        createdAt: string;
        updatedAt: string;
      };

      return {
        success: true,
        totalBottles: {
          ...bottles,
          createdAt: new Date(bottles.createdAt),
          updatedAt: new Date(bottles.updatedAt),
        },
      };
    }

    // If cache miss, fetch from database
    const [totalBottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt))
      .limit(1);

    if (totalBottles) {
      // Convert Date objects to strings for caching
      const cacheable = {
        ...totalBottles,
        createdAt: totalBottles.createdAt.toISOString(),
        updatedAt: totalBottles.updatedAt.toISOString(),
      };

      // Cache the result for future requests
      await redis.setValue("cache", "total_bottles", "latest", cacheable);
    }

    return { success: true, totalBottles };
  } catch (error) {
    console.error("Error fetching total bottles:", error);
    return { success: false, error };
  }
}
