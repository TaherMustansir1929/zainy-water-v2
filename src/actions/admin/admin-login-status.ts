"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { Admin } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function adminLoginStatus() {
  try {
    const admin_id = (await cookies()).get("admin_id");
    if (!admin_id?.value) {
      return { success: false, message: "Admin not logged in" };
    }

    const [admin_db] = await db
      .select()
      .from(Admin)
      .where(eq(Admin.id, admin_id.value))
      .limit(1);

    if (!admin_db) {
      return { success: false, message: "Admin not found" };
    }

    return { success: true, message: `Found admin with id: ${admin_id.value}` };
  } catch {
    return {
      success: false,
      message: "Error occurred while checking admin login status",
    };
  }
}
