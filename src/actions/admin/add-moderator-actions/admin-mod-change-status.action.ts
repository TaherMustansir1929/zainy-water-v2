"use server";
import { prisma } from "../../../lib/prisma";

export async function changeModeratorWorkingStatus(
  name: string,
  currentStatus: boolean
) {
  const updatedModerator = await prisma.moderator.update({
    where: { name: name },
    data: { isWorking: !currentStatus },
  });

  if (updatedModerator) {
    console.log(`Moderator: ${name} status changed successfully.`);
    return updatedModerator;
  } else {
    throw new Error(`Failed to change status for moderator: ${name}`);
  }
}
