"use server";

import { cookies } from "next/headers";
import { redis } from "@/lib/redis/storage";

export async function handleModeratorLogout() {
  const mod_id = (await cookies()).get("moderator_id");

  // Clear cached session data
  if (mod_id?.value) {
    await redis.deleteValue("session", "mod", mod_id.value);
  }

  (await cookies()).delete("moderator_id");
  console.log("Logout fn called successfully");
}
