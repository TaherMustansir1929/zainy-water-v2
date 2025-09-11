"use server";

import { Moderator as ModeratorData } from "@/modules/admin/add-moderator/ui/columns";
import { Moderator } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function updateModeratorByName(
  name: string,
  data: ModeratorData,
): Promise<typeof Moderator.$inferSelect> {
  try {
    const [updatedModerator] = await db
      .update(Moderator)
      .set({ ...data })
      .where(eq(Moderator.name, name))
      .returning();

    // If the moderator has a session, invalidate that
    if (updatedModerator.id) {
      await redis.deleteValue("session", "mod", updatedModerator.id);
    }

    return updatedModerator;
  } catch (error) {
    console.error("Failed to update moderator:", error);
    throw new Error("Could not update moderator");
  }
}
