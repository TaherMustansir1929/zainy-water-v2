"use server";

import { db } from "@/db";
import { BottleUsage, OtherExpense } from "@/db/schema";
import { endOfDay, startOfDay } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { redis } from "@/lib/redis/storage";

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
        )
        .orderBy(desc(BottleUsage.createdAt))
        .limit(1);

      if (!bottleUsage) {
        throw new Error("Bottle usage record not found for the given date");
      }

      if (
        bottleUsage.empty_bottles < data.refilled_bottles ||
        bottleUsage.caps < data.refilled_bottles
      ) {
        throw new Error(
          "Bottle refill cannot be more than caps or empty bottles available"
        );
      }

      await db
        .update(BottleUsage)
        .set({
          empty_bottles: bottleUsage.empty_bottles - data.refilled_bottles,
          remaining_bottles:
            bottleUsage.remaining_bottles + data.refilled_bottles,
        })
        .where(eq(BottleUsage.id, bottleUsage.id));
    }

    await db.insert(OtherExpense).values({
      moderator_id: data.moderator_id,
      amount: data.amount,
      description: data.description,
      date: data.date,
    });

    // Invalidate relevant caches after creating other expense
    const today = new Date().toDateString();
    const cacheKey = `other-exp-${data.moderator_id}-${today}`;
    await redis.deleteValue("temp", "other_expenses", cacheKey);

    if (data.refilled_bottles > 0) {
      await redis.deleteValue(
        "temp",
        "bottle_usage",
        `bottle-usage-${data.moderator_id}`
      );
    }

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
    // Try to get cached other expenses first
    const today = new Date().toDateString();
    const cacheKey = `other-exp-${id}-${today}`;
    const cachedExpenses = await redis.getValue(
      "temp",
      "other_expenses",
      cacheKey
    );

    if (cachedExpenses.success && cachedExpenses.data) {
      // Convert date strings back to Date objects
      const expenses = cachedExpenses.data as (Omit<
        typeof OtherExpense.$inferSelect,
        "date" | "createdAt" | "updatedAt"
      > & {
        date: string;
        createdAt: string;
        updatedAt: string;
      })[];

      return expenses.map((expense) => ({
        ...expense,
        date: new Date(expense.date),
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt),
      }));
    }

    // If cache miss, fetch from database
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

    if (expenses.length > 0) {
      // Convert Date objects to strings for caching
      const cacheable = expenses.map((expense) => ({
        ...expense,
        date: expense.date.toISOString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString(),
      }));

      // Cache with temp TTL since it's daily data that changes frequently
      await redis.setValue("temp", "other_expenses", cacheKey, cacheable);
    }

    return expenses;
  } catch (error) {
    console.error("Error fetching other expenses:", error);
    return null;
  }
}
