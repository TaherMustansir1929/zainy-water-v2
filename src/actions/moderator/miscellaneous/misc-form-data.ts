"use server";

import { db } from "@/db";
import { Miscellaneous } from "@/db/schema";
import { endOfDay, startOfDay } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";

export async function fetchMiscDeliveryByModId(
  id: string
): Promise<(typeof Miscellaneous.$inferSelect)[] | null> {
  const miscDelivery = await db
    .select()
    .from(Miscellaneous)
    .where(
      and(
        eq(Miscellaneous.moderator_id, id),
        gte(Miscellaneous.createdAt, startOfDay(new Date())),
        lte(Miscellaneous.createdAt, endOfDay(new Date()))
      )
    )
    .orderBy(desc(Miscellaneous.createdAt));

  return miscDelivery.length > 0 ? miscDelivery : null;
}
