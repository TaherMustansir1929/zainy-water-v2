"use server";
import { Moderator as ModeratorData } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { db } from "@/db";
import { Moderator } from "@/db/schema";

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

    return newModerator;
  } catch (error) {
    console.error("Error creating moderator:", error);
    throw error;
  }
}
