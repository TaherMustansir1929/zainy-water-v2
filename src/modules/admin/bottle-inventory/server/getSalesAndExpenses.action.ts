"use server";

import { db } from "@/db";
import { Delivery, Miscellaneous, Moderator, OtherExpense } from "@/db/schema";
import { startOfDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";

export async function getSalesAndExpenses(id: string, date: Date) {
  const to = new Date(date);
  const from = startOfDay(to);

  const [moderator] = await db
    .select({ id: Moderator.id })
    .from(Moderator)
    .where(eq(Moderator.id, id))
    .limit(1);

  if (!moderator) {
    throw new Error("Moderator not found");
  }

  const result = await db.transaction(async (tx) => {
    return await Promise.all([
      tx
        .select()
        .from(Delivery)
        .where(
          and(
            eq(Delivery.moderator_id, moderator.id),
            gte(Delivery.createdAt, from),
            lte(Delivery.createdAt, to)
          )
        ),

      tx
        .select()
        .from(Miscellaneous)
        .where(
          and(
            eq(Miscellaneous.moderator_id, moderator.id),
            gte(Miscellaneous.createdAt, from),
            lte(Miscellaneous.createdAt, to)
          )
        ),

      tx
        .select()
        .from(OtherExpense)
        .where(
          and(
            eq(OtherExpense.moderator_id, moderator.id),
            gte(OtherExpense.createdAt, from),
            lte(OtherExpense.createdAt, to)
          )
        ),
    ]);
  });

  const data = {
    deliveries: result[0],
    miscDeliveries: result[1],
    expenses: result[2],
  };

  let sales = 0;

  data.deliveries.forEach((delivery) => {
    sales += delivery.payment;
  });

  data.miscDeliveries.forEach((delivery) => {
    sales += delivery.payment;
  });

  let totalExpenses = 0;

  data.expenses.forEach((expense) => {
    totalExpenses += expense.amount;
  });

  return {
    sales,
    expenses: totalExpenses,
    date: date,
  };
}
