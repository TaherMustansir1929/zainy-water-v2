"use server";

import { db } from "@/db";
import { and, count, gte, lte } from "drizzle-orm";
import { Customer, Delivery, Moderator, OtherExpense } from "@/db/schema";
import { subDays } from "date-fns";

export type DashboardAnalytics = {
  customerCount: number;
  moderatorCount: number;
  totalRevenue: number;
};

export async function fetchDashboardAnalytics() {
  const now = new Date();
  const from = subDays(now, 30);

  try {
    const [customerCount] = await db.select({ total: count() }).from(Customer);
    const [moderatorCount] = await db
      .select({ total: count() })
      .from(Moderator);

    const deliveries = await db
      .select()
      .from(Delivery)
      .where(and(lte(Delivery.createdAt, now), gte(Delivery.createdAt, from)));

    const otherExpenses = await db
      .select()
      .from(OtherExpense)
      .where(
        and(
          lte(OtherExpense.createdAt, now),
          gte(OtherExpense.createdAt, from),
        ),
      );

    const totalPayment = deliveries
      .map((delivery) => delivery.payment)
      .reduce((a, b) => a + b, 0);

    const totalExpenses = otherExpenses
      .map((expense) => expense.amount)
      .reduce((a, b) => a + b, 0);

    const totalRevenue = totalPayment - totalExpenses;

    return {
      totalRevenue,
      customerCount: customerCount.total,
      moderatorCount: moderatorCount.total,
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    throw error;
  }
}
