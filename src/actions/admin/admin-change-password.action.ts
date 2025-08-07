"use server";

import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { Admin } from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";

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
