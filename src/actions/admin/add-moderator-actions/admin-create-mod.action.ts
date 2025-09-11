"use server";
import { Moderator as ModeratorData } from "@/modules/admin/add-moderator/ui/columns";
import { db } from "@/db";
import { Moderator } from "@/db/schema";

export async function createModerator(
  data: ModeratorData,
): Promise<typeof Moderator.$inferSelect> {
  try {
    const [newModerator] = await db
      .insert(Moderator)
      .values({
        ...data,
        name: data.name.toLowerCase(),
      })
      .returning();

    return newModerator;
  } catch (error) {
    console.error("Error creating moderator:", error);
    throw error;
  }
}
