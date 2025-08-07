"use server";

import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";

export async function adminMiddleware() {
  const admin_id = (await cookies()).get("admin_id")?.value;
  console.log({ admin_id });

  if (!admin_id) return false;

  const admin_db = await prisma.admin.findUnique({
    where: { id: admin_id },
  });

  if (!admin_db) {
    return false;
  }

  return true;
}
