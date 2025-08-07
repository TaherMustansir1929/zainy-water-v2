"use server";

import { prisma } from "../../lib/prisma";
import { cookies } from "next/headers";

export async function loginModerator(name: string, password: string) {
  const mod_data = await prisma.moderator.findUnique({
    where: {
      name,
      password,
    },
  });

  if (!mod_data) {
    return { success: false, message: "Invalid credentials", id: null };
  }

  if (!mod_data.isWorking) {
    return {
      success: false,
      message: "You are not a working moderator",
      id: null,
    };
  }

  (await cookies()).set("moderator_id", mod_data.id);

  return { success: true, message: "Login successful", mod_data };
}
