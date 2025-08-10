"use server";

import { db } from "@/db";
import { TotalBottles } from "@/db/schema";
import { redis } from "@/lib/redis";
import { desc, eq } from "drizzle-orm";

export type TotalBottlesDataProp = {
  total_bottles?: number;
  available_bottles?: number;
  used_bottles?: number;
  damaged_bottles?: number;
};

export async function updateTotalBottles(
  totalBottlesData: TotalBottlesDataProp
): Promise<{ success: boolean; message: string }> {
  const [latestTotalBottles] = await db
    .select()
    .from(TotalBottles)
    .orderBy(desc(TotalBottles.createdAt))
    .limit(1);

  if (!latestTotalBottles) {
    return { success: false, message: "Total bottles record not found" };
  }

  if (!!totalBottlesData.total_bottles) {
    // UPDATE TOTAL BOTTLES
    const availableBottles =
      latestTotalBottles.available_bottles +
      totalBottlesData.total_bottles -
      latestTotalBottles.total_bottles;

    const [updatedRecord] = await db
      .update(TotalBottles)
      .set({
        total_bottles: totalBottlesData.total_bottles,
        available_bottles: availableBottles,
      })
      .where(eq(TotalBottles.id, latestTotalBottles.id))
      .returning();

    if (updatedRecord) {
      await invalidateRedisCache(updatedRecord);
    }

    return { success: true, message: "Total bottles updated successfully" };
  } else if (!!totalBottlesData.available_bottles) {
    // UPDATE AVAILABLE BOTTLES
    if (totalBottlesData.available_bottles > latestTotalBottles.total_bottles) {
      return {
        success: false,
        message:
          "Available bottles cannot be greater than current available bottles",
      };
    }

    const used_bottles =
      latestTotalBottles.used_bottles -
      (totalBottlesData.available_bottles -
        latestTotalBottles.available_bottles);

    const [updatedRecord] = await db
      .update(TotalBottles)
      .set({
        available_bottles: totalBottlesData.available_bottles,
        used_bottles: used_bottles,
      })
      .where(eq(TotalBottles.id, latestTotalBottles.id))
      .returning();

    if (updatedRecord) {
      await invalidateRedisCache(updatedRecord);
    }

    return { success: true, message: "Available bottles updated successfully" };
  } else if (!!totalBottlesData.used_bottles) {
    // UPDATE USED BOTTLES
    if (totalBottlesData.used_bottles > latestTotalBottles.total_bottles) {
      return {
        success: false,
        message: "Used bottles cannot be greater than total available bottles",
      };
    }

    const available_bottles =
      latestTotalBottles.available_bottles -
      (totalBottlesData.used_bottles - latestTotalBottles.used_bottles);

    const [updatedRecord] = await db
      .update(TotalBottles)
      .set({
        available_bottles: available_bottles,
        used_bottles: totalBottlesData.used_bottles,
      })
      .where(eq(TotalBottles.id, latestTotalBottles.id))
      .returning();

    if (updatedRecord) {
      await invalidateRedisCache(updatedRecord);
    }

    return { success: true, message: "Used bottles updated successfully" };
  } else if (!!totalBottlesData.damaged_bottles) {
    // UPDATE DAMAGED BOTTLES
    const [updatedRecord] = await db
      .update(TotalBottles)
      .set({
        damaged_bottles: totalBottlesData.damaged_bottles,
        total_bottles:
          latestTotalBottles.total_bottles -
          (totalBottlesData.damaged_bottles -
            latestTotalBottles.damaged_bottles),
        available_bottles:
          latestTotalBottles.available_bottles -
          (totalBottlesData.damaged_bottles -
            latestTotalBottles.damaged_bottles),
      })
      .where(eq(TotalBottles.id, latestTotalBottles.id))
      .returning();

    if (updatedRecord) {
      await invalidateRedisCache(updatedRecord);
    }

    return { success: true, message: "Damaged bottles updated successfully" };
  }

  return { success: false, message: "Atleast one field must be provided" };
}

async function invalidateRedisCache(
  newTotalBottles: typeof TotalBottles.$inferSelect
) {
  // Convert Date objects to strings for caching
  const cacheable = {
    ...newTotalBottles,
    createdAt: newTotalBottles.createdAt.toISOString(),
    updatedAt: newTotalBottles.updatedAt.toISOString(),
  };

  // Cache the result for future requests
  await redis.setValue("cache", "total_bottles", "latest", cacheable);
}
