"use server";

import { db } from "@/db";
import { Admin } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis/storage";

export async function loginAdmin(name: string, password: string) {
  const [admin_data] = await db
    .select()
    .from(Admin)
    .where(and(eq(Admin.name, name), eq(Admin.password, password)))
    .limit(1);

  if (!admin_data) {
    return { success: false, message: "Invalid credentials", id: null };
  }

  // Set session cookie
  (await cookies()).set("admin_id", admin_data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });

  // Cache admin session data
  await redis.setValue("session", "admin", admin_data.id, {
    id: admin_data.id,
    name: admin_data.name,
    loginTime: new Date().toISOString(),
  });

  return { success: true, message: "Login successful", admin_data };
}
