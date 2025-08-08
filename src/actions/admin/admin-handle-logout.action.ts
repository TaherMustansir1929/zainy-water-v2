"use server";

import { cookies } from "next/headers";

export async function handleAdminLogout() {
  (await cookies()).delete("admin_id");
  console.log("Logout fn called successfully");
}
