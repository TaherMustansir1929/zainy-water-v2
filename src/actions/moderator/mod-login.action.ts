"use server";

import { db } from "@/db";
import { cookies } from "next/headers";
import { Moderator } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redis } from "../../lib/redis/storage";

export async function loginModerator(name: string, password: string) {
  name = name.toLowerCase();
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

  (await cookies()).set("moderator_id", mod_data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });

  // Cache moderator session data
  await redis.setValue("session", "mod", mod_data.id, {
    id: mod_data.id,
    name: mod_data.name,
    areas: mod_data.areas,
    isWorking: mod_data.isWorking,
    loginTime: new Date().toISOString(),
  });

  return { success: true, message: "Login successful", mod_data };
}
