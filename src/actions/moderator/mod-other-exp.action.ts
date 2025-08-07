"use server";

import { OtherExpense } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export type OtherExpenseData = {
  moderator_id: string;
  amount: number;
  description: string;
  date: Date;
};

export async function createOtherExpense(
  data: OtherExpenseData
): Promise<OtherExpense | null> {
  try {
    const expense = await prisma.otherExpense.create({
      data: {
        moderator_id: data.moderator_id,
        amount: data.amount,
        description: data.description,
        date: data.date,
      },
    });

    return expense;
  } catch (error) {
    console.error("Error creating other expense:", error);
    return null;
  }
}

export async function getOtherExpensesByModeratorId(
  id: string
): Promise<OtherExpense[] | null> {
  try {
    const expenses = await prisma.otherExpense.findMany({
      where: {
        moderator_id: id,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        },
      },
      orderBy: { date: "desc" }, // Order by date descending
    });
    return expenses;
  } catch (error) {
    console.error("Error fetching other expenses:", error);
    return null;
  }
}
