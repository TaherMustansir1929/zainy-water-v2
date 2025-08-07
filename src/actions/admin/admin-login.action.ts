"use server";

import { db } from "@/db";
import { Admin } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function loginAdmin(name: string, password: string) {
  const [admin_data] = await db
    .select()
    .from(Admin)
    .where(and(eq(Admin.name, name), eq(Admin.password, password)))
    .limit(1);

  if (!admin_data) {
    return { success: false, message: "Invalid credentials", id: null };
  }

  (await cookies()).set("admin_id", admin_data.id);

  return { success: true, message: "Login successful", admin_data };
}
