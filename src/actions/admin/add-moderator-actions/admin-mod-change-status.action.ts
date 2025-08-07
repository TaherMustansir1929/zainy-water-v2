"use server";

import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function changeModeratorWorkingStatus(
  name: string,
  currentStatus: boolean
) {
  const [updatedModerator] = await db
    .update(Moderator)
    .set({
      isWorking: !currentStatus,
    })
    .where(eq(Moderator.name, name))
    .returning();

  if (updatedModerator) {
    console.log(`Moderator: ${name} status changed successfully.`);
    return updatedModerator;
  } else {
    throw new Error(`Failed to change status for moderator: ${name}`);
  }
}
