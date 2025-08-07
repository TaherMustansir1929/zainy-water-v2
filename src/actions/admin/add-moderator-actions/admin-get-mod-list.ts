"use server";

import { prisma } from "../../../lib/prisma";

export async function getAllModeratorList() {
  try {
    const data = await prisma.moderator.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching moderators:", error);
    return [];
  }
}
