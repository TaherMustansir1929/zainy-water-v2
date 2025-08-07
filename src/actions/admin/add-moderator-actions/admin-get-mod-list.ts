"use server";

import { db } from "@/db";
import { Moderator } from "@/db/schema";

export async function getAllModeratorList(): Promise<
  (typeof Moderator.$inferSelect)[]
> {
  try {
    const data = await db.select().from(Moderator);
    return data;
  } catch (error) {
    console.error("Error fetching moderators:", error);
    return [];
  }
}
