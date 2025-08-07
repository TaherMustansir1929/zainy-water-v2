"use server";

import { Moderator as ModeratorData } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { Moderator } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function updateModeratorByName(
  name: string,
  data: ModeratorData
): Promise<typeof Moderator.$inferSelect> {
  try {
    const [updatedModerator] = await db
      .update(Moderator)
      .set({ ...data })
      .where(eq(Moderator.name, name))
      .returning();

    return updatedModerator;
  } catch (error) {
    console.error("Failed to update moderator:", error);
    throw new Error("Could not update moderator");
  }
}
