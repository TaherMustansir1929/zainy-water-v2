"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function modLoginStatus() {
  try {
    const mod_id = (await cookies()).get("moderator_id");
    if (!mod_id?.value) {
      return { success: false, message: "Not logged in" };
    }

    const [mod_db] = await db
      .select()
      .from(Moderator)
      .where(eq(Moderator.id, mod_id.value))
      .limit(1);

    if (!mod_db) {
      return { success: false, message: "Moderator not found" };
    }

    return {
      success: true,
      message: `Found moderator with id: ${mod_id.value}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error checking login status ${error}`,
    };
  }
}
