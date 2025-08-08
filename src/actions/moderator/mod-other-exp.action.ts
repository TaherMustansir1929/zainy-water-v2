"use server";

import { db } from "@/db";
import { BottleUsage, OtherExpense } from "@/db/schema";
import { endOfDay, startOfDay } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";

export type OtherExpenseData = {
  moderator_id: string;
  refilled_bottles: number;
  amount: number;
  description: string;
  date: Date;
};

export async function createOtherExpense(
  data: OtherExpenseData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    if (data.refilled_bottles > 0) {
      const [bottleUsage] = await db
        .select()
        .from(BottleUsage)
        .where(
          and(
            eq(BottleUsage.moderator_id, data.moderator_id),
            gte(BottleUsage.createdAt, startOfDay(data.date)),
            lte(BottleUsage.createdAt, endOfDay(data.date))
          )
        );

      if (
        bottleUsage.empty_bottles < data.refilled_bottles ||
        bottleUsage.caps < data.refilled_bottles
      ) {
        throw new Error(
          "Bottle refill cannot be more than caps or empty bottles available"
        );
      }

      await db.update(BottleUsage).set({
        empty_bottles: bottleUsage.empty_bottles - data.refilled_bottles,
        returned_bottles: bottleUsage.returned_bottles + data.refilled_bottles,
      });
    }

    await db.insert(OtherExpense).values({
      moderator_id: data.moderator_id,
      amount: data.amount,
      description: data.description,
      date: data.date,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating other expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
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
