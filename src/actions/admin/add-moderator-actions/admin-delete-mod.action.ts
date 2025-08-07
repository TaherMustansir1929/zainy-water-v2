"use server";

import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteModerator(name: string) {
  try {
    await db.delete(Moderator).where(eq(Moderator.name, name));

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
