"use server";

import { db } from "@/db";
import { Admin } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis/storage";

export async function adminMiddleware() {
  const admin_id = (await cookies()).get("admin_id")?.value;
  console.log({ admin_id });

  if (!admin_id) return { success: false, error: "Admin not logged in" };

  // Try to get cached admin data first
  const cachedAdmin = await redis.getValue("session", "admin", admin_id);

  if (cachedAdmin.success && cachedAdmin.data) {
    return { success: true, data: cachedAdmin.data };
  }

  // If cache miss, check database and cache the result
  const [admin_db] = await db
    .select()
    .from(Admin)
    .where(eq(Admin.id, admin_id))
    .limit(1);

  if (!admin_db) {
    return { success: false, error: "Admin not found" };
  }

  // Cache admin session data for future requests
  await redis.setValue("session", "admin", admin_id, {
    id: admin_db.id,
    name: admin_db.name,
    loginTime: new Date().toISOString(),
  });

  return { success: true, data: admin_db };
}
