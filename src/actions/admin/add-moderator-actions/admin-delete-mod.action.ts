"use server";

import { prisma } from "../../../lib/prisma";

export async function deleteModerator(name: string) {
  try {
    await prisma.moderator.delete({
      where: { name: name },
    });
    console.log(`Moderator: ${name} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting moderator: ${name}:`, error);
    throw new Error(
      `Failed to delete moderator: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
