"use server";

import { db } from "@/db";
import { Customer, Delivery, Miscellaneous, Moderator } from "@/db/schema";
import { subDays } from "date-fns";
import { and, count, gte, lte } from "drizzle-orm";

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

    const miscellaneousDeliveries = await db
      .select()
      .from(Miscellaneous)
      .where(
        and(
          lte(Miscellaneous.createdAt, now),
          gte(Miscellaneous.createdAt, from)
        )
      );

    const totalDelivery = deliveries
      .map((delivery) => delivery.payment)
      .reduce((a, b) => a + b, 0);

    const totalMiscellaneous = miscellaneousDeliveries
      .map((delivery) => delivery.payment)
      .reduce((a, b) => a + b, 0);

    const totalRevenue = totalDelivery + totalMiscellaneous;

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
