"use server";

import { db } from "@/db";
import { BottleUsage, Moderator } from "@/db/schema";
import { endOfDay, startOfDay } from "date-fns";
import { and, gte, lte, eq, desc } from "drizzle-orm";

export type BottleUsage30dDataProps = {
  moderator: typeof Moderator.$inferSelect;
  bottleUsage: typeof BottleUsage.$inferSelect;
};

export async function fetch30dBottleUsage(): Promise<{
  success: boolean;
  data: BottleUsage30dDataProps[];
}> {
  // Use JOIN query instead of multiple database calls
  const bottleUsagesWithModerator = await db
    .select()
    .from(BottleUsage)
    .where(
      and(
        lte(BottleUsage.createdAt, endOfDay(new Date())),
        gte(
          BottleUsage.createdAt,
          startOfDay(new Date(new Date().setDate(new Date().getDate() - 30)))
        )
      )
    )
    .innerJoin(Moderator, eq(BottleUsage.moderator_id, Moderator.id))
    .orderBy(desc(BottleUsage.createdAt));

  return {
    success: true,
    data: bottleUsagesWithModerator.map((item) => ({
      moderator: item.Moderator,
      bottleUsage: item.BottleUsage,
    })),
  };
}
