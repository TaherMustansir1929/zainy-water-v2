"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function modLoginStatus() {
  try {
    const mod_id = (await cookies()).get("moderator_id");
    if (!mod_id?.value) {
      return { success: false, message: "Not logged in" };
    }

    // Try to get cached session data first
    const cachedSession = await redis.getValue("session", "mod", mod_id.value);

    if (cachedSession.success && cachedSession.data) {
      return {
        success: true,
        message: `Found moderator with id: ${mod_id.value}`,
      };
    }

    // If cache miss, check database and update cache
    const [mod_db] = await db
      .select()
      .from(Moderator)
      .where(eq(Moderator.id, mod_id.value))
      .limit(1);

    if (!mod_db) {
      return { success: false, message: "Moderator not found" };
    }

    // Cache the session data for future requests
    await redis.setValue("session", "mod", mod_id.value, {
      id: mod_db.id,
      name: mod_db.name,
      areas: mod_db.areas,
      isWorking: mod_db.isWorking,
      loginTime: new Date().toISOString(),
    });

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
