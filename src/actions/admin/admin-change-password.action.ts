"use server";

import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import { createId } from "@paralleldrive/cuid2";
import { Admin } from "@prisma/client";

export async function changeAdminPasswordAndId(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; admin?: Admin; error?: string }> {
  try {
    const admin_id = (await cookies()).get("admin_id")?.value;
    console.log({ admin_id });

    if (!admin_id) {
      throw new Error("Admin not authenticated");
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: admin_id, password: currentPassword },
      data: { password: newPassword, id: createId() },
    });

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
