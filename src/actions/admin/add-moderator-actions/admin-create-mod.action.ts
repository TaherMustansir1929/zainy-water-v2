"use server";
import { Moderator as ModeratorData } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { redis } from "@/lib/redis/storage";

export async function createModerator(
  data: ModeratorData
): Promise<typeof Moderator.$inferSelect> {
  try {
    const [newModerator] = await db
      .insert(Moderator)
      .values({
        ...data,
      })
      .returning();

    // Invalidate moderator list cache since we added a new moderator
    await redis.deleteValue("cache", "admin", "mod-list");

    return newModerator;
  } catch (error) {
    console.error("Error creating moderator:", error);
    throw error;
  }
}
