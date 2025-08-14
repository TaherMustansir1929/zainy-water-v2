"use server";

import { db } from "@/db";
import { Moderator, OtherExpense } from "@/db/schema";
import { subDays } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";

export type OtherExpense30dRecords = {
  Moderator: typeof Moderator.$inferSelect;
  OtherExpense: typeof OtherExpense.$inferSelect;
}

export async function fetch30dOtherExpense(): Promise<OtherExpense30dRecords[]> {
  const now = new Date();
  const from = subDays(now, 30);

  try {
    const otherExpense = await db.select().from(OtherExpense)
      .where(
        and(
          gte(OtherExpense.createdAt, from),
          lte(OtherExpense.createdAt, now),
        )
      )
      .innerJoin(Moderator, eq(Moderator.id, OtherExpense.moderator_id))
      .orderBy(desc(OtherExpense.createdAt));

    return otherExpense;

  } catch (error) {
    console.error("Error fetching 30d Other Expense: ", error);
    throw error;
  }
}
