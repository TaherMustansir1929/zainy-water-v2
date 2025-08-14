"use server";

import { db } from "@/db";
import { Miscellaneous, Moderator } from "@/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { subDays } from "date-fns";

export type MiscDeliveriesRecords = {
  Miscellaneous: typeof Miscellaneous.$inferSelect;
  Moderator: typeof Moderator.$inferSelect;
};

export async function fetch30DMiscDeliveries(): Promise<
  MiscDeliveriesRecords[]
> {
  const now = new Date();
  const from = subDays(now, 30);

  try {
    const misc_deliveries = await db
      .select()
      .from(Miscellaneous)
      .where(
        and(
          lte(Miscellaneous.createdAt, now),
          gte(Miscellaneous.createdAt, from),
        ),
      )
      .innerJoin(Moderator, eq(Miscellaneous.moderator_id, Moderator.id))
      .orderBy(desc(Miscellaneous.createdAt));

    return misc_deliveries;
  } catch (error) {
    console.error("Error fetching 30D misc deliveries:", error);
    throw error;
  }
}
