"use server";

import { db } from "@/db";
import { cookies } from "next/headers";
import { Moderator } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function loginModerator(name: string, password: string) {
  const [mod_data] = await db
    .select()
    .from(Moderator)
    .where(and(eq(Moderator.name, name), eq(Moderator.password, password)))
    .limit(1);

  if (!mod_data) {
    return { success: false, message: "Invalid credentials", id: null };
  }

  if (!mod_data.isWorking) {
    return {
      success: false,
      message: "You are not a working moderator",
      id: null,
    };
  }

  (await cookies()).set("moderator_id", mod_data.id);

  return { success: true, message: "Login successful", mod_data };
}
