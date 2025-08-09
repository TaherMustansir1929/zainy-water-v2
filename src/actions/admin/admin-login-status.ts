"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { Admin } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function adminLoginStatus() {
  try {
    const admin_id = (await cookies()).get("admin_id");
    if (!admin_id?.value) {
      return { success: false, message: "Admin not logged in" };
    }

    // Try to get cached session data first
    const cachedSession = await redis.getValue(
      "session",
      "admin",
      admin_id.value
    );

    if (cachedSession.success && cachedSession.data) {
      return {
        success: true,
        message: `Found admin with id: ${admin_id.value}`,
      };
    }

    // If cache miss, check database and update cache
    const [admin_db] = await db
      .select()
      .from(Admin)
      .where(eq(Admin.id, admin_id.value))
      .limit(1);

    if (!admin_db) {
      return { success: false, message: "Admin not found" };
    }

    // Cache the session data for future requests
    await redis.setValue("session", "admin", admin_id.value, {
      id: admin_db.id,
      name: admin_db.name,
      loginTime: new Date().toISOString(),
    });

    return { success: true, message: `Found admin with id: ${admin_id.value}` };
  } catch {
    return {
      success: false,
      message: "Error occurred while checking admin login status",
    };
  }
}
