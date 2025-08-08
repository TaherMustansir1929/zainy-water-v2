"use server";

import { cookies } from "next/headers";

export async function handleModeratorLogout() {
  (await cookies()).delete("moderator_id");
  console.log("Logout fn called successfully");
}
