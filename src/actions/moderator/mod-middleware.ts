"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function moderatorMiddleware() {
  const moderator_id = (await cookies()).get("moderator_id")?.value;
  console.log({ moderator_id });

  if (!moderator_id)
    return { success: false, message: "Moderator ID not found in cookies" };

  const [mod_db] = await db
    .select({ isWorking: Moderator.isWorking })
    .from(Moderator)
    .where(eq(Moderator.id, moderator_id))
    .limit(1);

  if (!mod_db) {
    console.log("Moderator not found in database");
    return { success: false, message: "Moderator not found in database" };
  }

  if (!mod_db.isWorking) {
    console.log("Moderator is not working");
    return { success: false, message: "Moderator is not working" };
  }

  return { success: true, message: "Moderator is authorized" };
}
