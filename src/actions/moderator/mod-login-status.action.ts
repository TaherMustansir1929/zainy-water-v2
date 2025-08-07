"use server";

import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";

export async function modLoginStatus() {
  try {
    const mod_id = (await cookies()).get("moderator_id");
    if (!mod_id?.value) {
      return { success: false, message: "Not logged in" };
    }

    const mod_db = await prisma.moderator.findUnique({
      where: { id: mod_id.value },
    });

    if (!mod_db) {
      return { success: false, message: "Moderator not found" };
    }

    return {
      success: true,
      message: `Found moderator with id: ${mod_id.value}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error checking login status ${error}`,
    };
  }
}
