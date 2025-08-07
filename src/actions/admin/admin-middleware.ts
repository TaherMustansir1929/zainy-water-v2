"use server";

import { db } from "@/db";
import { Admin } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function adminMiddleware() {
  const admin_id = (await cookies()).get("admin_id")?.value;
  console.log({ admin_id });

  if (!admin_id) return { success: false, error: "Admin not logged in" };

  const [admin_db] = await db
    .select()
    .from(Admin)
    .where(eq(Admin.id, admin_id))
    .limit(1);

  if (!admin_db) {
    return { success: false, error: "Admin not found" };
  }

  return { success: true, data: admin_db };
}
