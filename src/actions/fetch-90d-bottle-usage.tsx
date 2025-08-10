"use server";

import { db } from "@/db";
import { BottleUsage, Moderator } from "@/db/schema";
import { endOfDay, startOfDay } from "date-fns";
import { and, gte, lte, eq } from "drizzle-orm";

export type BottleUsage90dDataProps = {
  moderator_name: string;
  id: string;
  moderator_id: string;
  filled_bottles: number;
  sales: number;
  empty_bottles: number;
  remaining_bottles: number;
  returned_bottles: number;
  caps: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function fetch90dBottleUsage(): Promise<{
  success: boolean;
  data: BottleUsage90dDataProps[];
}> {
  // Use JOIN query instead of multiple database calls
  const bottleUsagesWithModerator = await db
    .select({
      id: BottleUsage.id,
      moderator_id: BottleUsage.moderator_id,
      filled_bottles: BottleUsage.filled_bottles,
      sales: BottleUsage.sales,
      empty_bottles: BottleUsage.empty_bottles,
      remaining_bottles: BottleUsage.remaining_bottles,
      returned_bottles: BottleUsage.returned_bottles,
      caps: BottleUsage.caps,
      createdAt: BottleUsage.createdAt,
      updatedAt: BottleUsage.updatedAt,
      moderator_name: Moderator.name,
    })
    .from(BottleUsage)
    .innerJoin(Moderator, eq(BottleUsage.moderator_id, Moderator.id))
    .where(
      and(
        lte(BottleUsage.createdAt, endOfDay(new Date())),
        gte(
          BottleUsage.createdAt,
          startOfDay(new Date(new Date().setDate(new Date().getDate() - 90)))
        )
      )
    );

  return { success: true, data: bottleUsagesWithModerator };
}
