"use server";

import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { redis } from "@/lib/redis/storage";

export async function getAllModeratorList(): Promise<
  (typeof Moderator.$inferSelect)[]
> {
  try {
    // Try to get cached moderator list first
    const cachedModList = await redis.getValue("cache", "admin", "mod-list");

    if (cachedModList.success && cachedModList.data) {
      // Convert date strings back to Date objects
      const moderators = cachedModList.data as (Omit<
        typeof Moderator.$inferSelect,
        "createdAt" | "updatedAt"
      > & {
        createdAt: string;
        updatedAt: string;
      })[];
      return moderators.map((mod) => ({
        ...mod,
        createdAt: new Date(mod.createdAt),
        updatedAt: new Date(mod.updatedAt),
      }));
    }

    // If cache miss, fetch from database
    const data = await db.select().from(Moderator);

    // Convert Date objects to strings for caching
    const cacheable = data.map((mod) => ({
      ...mod,
      createdAt: mod.createdAt.toISOString(),
      updatedAt: mod.updatedAt.toISOString(),
    }));

    // Cache the result for future requests
    await redis.setValue("cache", "admin", "mod-list", cacheable);

    return data;
  } catch (error) {
    console.error("Error fetching moderators:", error);
    return [];
  }
}
