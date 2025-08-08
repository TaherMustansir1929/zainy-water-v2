"use server";

import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function fetchModeratorBottleUsage(
  id: string
): Promise<typeof BottleUsage.$inferSelect | null> {
  try {
    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(eq(BottleUsage.moderator_id, id))
      .limit(1);
    return bottleUsage ?? null;
  } catch (error) {
    console.error("Error fetching bottle usage:", error);
    return null;
  }
}
