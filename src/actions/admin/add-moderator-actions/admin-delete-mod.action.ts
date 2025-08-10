"use server";

import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function deleteModerator(name: string) {
  try {
    // First get the moderator to get their ID for session invalidation
    const [moderatorToDelete] = await db
      .select({ id: Moderator.id })
      .from(Moderator)
      .where(eq(Moderator.name, name))
      .limit(1);

    await db.delete(Moderator).where(eq(Moderator.name, name));

    // If the moderator had a session, invalidate that
    if (moderatorToDelete?.id) {
      await redis.deleteValue("session", "mod", moderatorToDelete.id);
    }

    console.log(`Moderator: ${name} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting moderator: ${name}:`, error);
    throw new Error(
      `Failed to delete moderator: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
