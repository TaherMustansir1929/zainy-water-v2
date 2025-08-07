"use server";
import { Moderator } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { prisma } from "../../../lib/prisma";

export async function createModerator(data: Moderator) {
  try {
    const newModerator = await prisma.moderator.create({
      data: {
        ...data,
      },
    });
    return newModerator;
  } catch (error) {
    console.error("Error creating moderator:", error);
    throw error;
  }
}
