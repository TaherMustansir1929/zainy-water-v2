"use server";

import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";

export async function adminLoginStatus() {
  try {
    const admin_id = (await cookies()).get("admin_id");
    if (!admin_id?.value) {
      return { success: false, message: "Admin not logged in" };
    }

    const admin_db = await prisma.admin.findUnique({
      where: { id: admin_id.value },
    });

    if (!admin_db) {
      return { success: false, message: "Admin not found" };
    }

    return { success: true, message: `Found admin with id: ${admin_id.value}` };
  } catch (error) {
    return {
      success: false,
      message: "Error occurred while checking admin login status",
    };
  }
}
