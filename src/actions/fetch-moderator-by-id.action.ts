"use server";

import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function fetchModeratorById(
  mod_id: string
): Promise<typeof Moderator.$inferSelect> {
  const [moderator] = await db
    .select()
    .from(Moderator)
    .where(eq(Moderator.id, mod_id))
    .limit(1);

  if (!moderator) {
    throw new Error("Moderator not found");
  }

  return moderator;
}
