"use server";

import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { Admin } from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

export async function changeAdminPasswordAndId(
  currentPassword: string,
  newPassword: string
): Promise<{
  success: boolean;
  admin?: typeof Admin.$inferSelect;
  error?: string;
}> {
  try {
    const admin_id = (await cookies()).get("admin_id")?.value;
    console.log({ admin_id });

    if (!admin_id) {
      throw new Error("Admin not authenticated");
    }

    const [updatedAdmin] = await db
      .update(Admin)
      .set({ password: newPassword, id: createId() })
      .where(and(eq(Admin.id, admin_id), eq(Admin.password, currentPassword)))
      .returning();

    if (!updatedAdmin) {
      throw new Error("Failed to update admin password");
    }

    // Clear old admin session cache
    await redis.deleteValue("session", "admin", admin_id);

    // refresh cookie if id changed
    const cookieStore = await cookies();
    if (updatedAdmin.id && updatedAdmin.id !== admin_id) {
      cookieStore.set("admin_id", updatedAdmin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });

      // Cache new admin session data
      await redis.setValue("session", "admin", updatedAdmin.id, {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        loginTime: new Date().toISOString(),
      });
    }

    return { success: true, admin: updatedAdmin };
  } catch (error) {
    console.error("Error changing admin password:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
