"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function moderatorMiddleware() {
  const moderator_id = (await cookies()).get("moderator_id")?.value;
  console.log({ moderator_id });

  if (!moderator_id)
    return { success: false, message: "Moderator ID not found in cookies" };

  // Try to get cached moderator session data first
  const cachedModerator = await redis.getValue("session", "mod", moderator_id);

  if (cachedModerator.success && cachedModerator.data) {
    const modData = cachedModerator.data as {
      isWorking: boolean;
      [key: string]: unknown;
    };

    if (!modData.isWorking) {
      console.log("Moderator is not working");
      return { success: false, message: "Moderator is not working" };
    }

    return { success: true, message: "Moderator is authorized" };
  }

  // If cache miss, check database and cache the result
  const [mod_db] = await db
    .select({
      id: Moderator.id,
      isWorking: Moderator.isWorking,
      name: Moderator.name,
      areas: Moderator.areas,
    })
    .from(Moderator)
    .where(eq(Moderator.id, moderator_id))
    .limit(1);

  if (!mod_db) {
    console.log("Moderator not found in database");
    return { success: false, message: "Moderator not found in database" };
  }

  // Cache moderator session data for future requests
  await redis.setValue("session", "mod", moderator_id, {
    id: mod_db.id,
    name: mod_db.name,
    areas: mod_db.areas,
    isWorking: mod_db.isWorking,
    loginTime: new Date().toISOString(),
  });

  if (!mod_db.isWorking) {
    console.log("Moderator is not working");
    return { success: false, message: "Moderator is not working" };
  }

  return { success: true, message: "Moderator is authorized" };
}
