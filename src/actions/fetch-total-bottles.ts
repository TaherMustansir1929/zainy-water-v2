"use server";

import { db } from "@/db";
import { TotalBottles } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function fetchTotalBottles(): Promise<
  | {
      success: true;
      totalBottles: typeof TotalBottles.$inferSelect;
    }
  | { success: false; error: unknown }
> {
  try {
    // Fetch from database directly
    const [totalBottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt))
      .limit(1);

    return { success: true, totalBottles };
  } catch (error) {
    console.error("Error fetching total bottles:", error);
    return { success: false, error };
  }
}
