"use server";

import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function changeModeratorWorkingStatus(
  name: string,
  currentStatus: boolean,
) {
  name = name.toLowerCase();
  const [updatedModerator] = await db
    .update(Moderator)
    .set({
      isWorking: !currentStatus,
    })
    .where(eq(Moderator.name, name))
    .returning();

  if (updatedModerator) {
    console.log(`Moderator: ${name} status changed successfully.`);

    // Invalidate the moderator's session since working status changed
    await redis.deleteValue("session", "mod", updatedModerator.id);

    return updatedModerator;
  } else {
    throw new Error(`Failed to change status for moderator: ${name}`);
  }
}
