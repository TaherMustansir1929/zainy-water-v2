"use server";

import { prisma } from "../../lib/prisma";
import { cookies } from "next/headers";

export async function loginAdmin(name: string, password: string) {
  const admin_data = await prisma.admin.findUnique({
    where: {
      name,
      password,
    },
  });

  if (!admin_data) {
    return { success: false, message: "Invalid credentials", id: null };
  }

  (await cookies()).set("admin_id", admin_data.id);

  return { success: true, message: "Login successful", admin_data };
}
