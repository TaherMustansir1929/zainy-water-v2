"use server";

import { db } from "@/db";
import { Customer, Delivery, Moderator } from "@/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { subDays } from "date-fns";

export type Delivery30dRow = {
  Delivery: typeof Delivery.$inferSelect;
  Moderator: typeof Moderator.$inferSelect;
  Customer: typeof Customer.$inferSelect;
};

export async function fetch30DDeliveries(): Promise<Delivery30dRow[]> {
  const now = new Date();
  const from = subDays(now, 30);

  const deliveries = await db
    .select()
    .from(Delivery)
    .where(and(lte(Delivery.createdAt, now), gte(Delivery.createdAt, from)))
    .innerJoin(Moderator, eq(Delivery.moderator_id, Moderator.id))
    .innerJoin(Customer, eq(Delivery.customer_id, Customer.customer_id))
    .orderBy(desc(Delivery.createdAt));

  // Return fully joined rows to avoid N+1 queries
  return deliveries as Delivery30dRow[];
}
