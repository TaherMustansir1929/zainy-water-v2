"use server";

import { Moderator } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { Moderator as ModeratorPrisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

export async function updateModeratorByName(
  name: string,
  data: Moderator
): Promise<ModeratorPrisma> {
  try {
    const updatedModerator = await prisma.moderator.update({
      where: { name: name },
      data: {
        ...data,
      },
    });

    return updatedModerator;
  } catch (error) {
    console.error("Failed to update moderator:", error);
    throw new Error("Could not update moderator");
  }
}
