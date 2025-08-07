"use server";

import { db } from "@/db";
import { OtherExpense } from "@/db/schema";
import { endOfDay, startOfDay } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";

export type OtherExpenseData = {
  moderator_id: string;
  amount: number;
  description: string;
  date: Date;
};

export async function createOtherExpense(
  data: OtherExpenseData
): Promise<typeof OtherExpense.$inferSelect | null> {
  try {
    const [expense] = await db
      .insert(OtherExpense)
      .values({
        moderator_id: data.moderator_id,
        amount: data.amount,
        description: data.description,
        date: data.date,
      })
      .returning();

    return expense;
  } catch (error) {
    console.error("Error creating other expense:", error);
    return null;
  }
}

export async function getOtherExpensesByModeratorId(
  id: string
): Promise<(typeof OtherExpense.$inferSelect)[] | null> {
  try {
    const expenses = await db
      .select()
      .from(OtherExpense)
      .where(
        and(
          eq(OtherExpense.moderator_id, id),
          gte(OtherExpense.date, startOfDay(new Date())),
          lte(OtherExpense.date, endOfDay(new Date()))
        )
      )
      .orderBy(desc(OtherExpense.date));

    return expenses;
  } catch (error) {
    console.error("Error fetching other expenses:", error);
    return null;
  }
}
