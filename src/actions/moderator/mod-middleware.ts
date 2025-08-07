"use server";

import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";

export async function moderatorMiddleware() {
  const moderator_id = (await cookies()).get("moderator_id")?.value;
  console.log({ moderator_id });

  if (!moderator_id)
    return { success: false, message: "Moderator ID not found in cookies" };

  const mod_db = await prisma.moderator.findUnique({
    where: { id: moderator_id },
    select: {
      isWorking: true,
    },
  });

  if (!mod_db) {
    console.log("Moderator not found in database");
    return { success: false, message: "Moderator not found in database" };
  }

  if (!mod_db.isWorking) {
    console.log("Moderator is not working");
    return { success: false, message: "Moderator is not working" };
  }

  return { success: true, message: "Moderator is authorized" };
}
