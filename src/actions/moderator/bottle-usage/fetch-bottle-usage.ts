"use server";

import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function fetchModeratorBottleUsage(
  id: string
): Promise<typeof BottleUsage.$inferSelect | null> {
  try {
    // Fetch from database directly
    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(eq(BottleUsage.moderator_id, id))
      .orderBy(desc(BottleUsage.createdAt))
      .limit(1);

    return bottleUsage ?? null;
  } catch (error) {
    console.error("Error fetching bottle usage:", error);
    return null;
  }
}
