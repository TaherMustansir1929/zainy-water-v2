"use server";

import { cookies } from "next/headers";
import { redis } from "@/lib/redis/storage";

export async function handleAdminLogout() {
  const admin_id = (await cookies()).get("admin_id");

  // Clear cached session data
  if (admin_id?.value) {
    await redis.deleteValue("session", "admin", admin_id.value);
  }

  (await cookies()).delete("admin_id");
  console.log("Logout fn called successfully");
}
