"use server";

import { db } from "@/db";
import { BottleUsage, TotalBottles } from "@/db/schema";
import { and, desc, eq, gt, lte } from "drizzle-orm";
import { startOfDay } from "date-fns";

export type MiscellaneousBottleUsageDataProps = {
  moderator_id: string;
  empty_bottles: number;
  damaged_bottles: number;
};

export async function addMiscellaneousBottleUsage(
  data: MiscellaneousBottleUsageDataProps,
) {
  const [totalBottles] = await db
    .select()
    .from(TotalBottles)
    .orderBy(desc(TotalBottles.createdAt))
    .limit(1);

  if (!totalBottles) {
    throw new Error("Total bottles not found");
  }

  const [bottleUsage] = await db
    .select()
    .from(BottleUsage)
    .where(
      and(
        eq(BottleUsage.moderator_id, data.moderator_id),
        lte(BottleUsage.createdAt, new Date()),
        gt(BottleUsage.createdAt, startOfDay(new Date())),
      ),
    );

  if (!!bottleUsage) {
    await db
      .update(BottleUsage)
      .set({
        empty_bottles: bottleUsage.empty_bottles + data.empty_bottles,
      })
      .where(eq(BottleUsage.id, bottleUsage.id));
  } else {
    const bottleUsageData: typeof BottleUsage.$inferInsert = {
      moderator_id: data.moderator_id,
      empty_bottles: data.empty_bottles,
      remaining_bottles: 0,
      caps: 0,
      filled_bottles: 0,
      returned_bottles: 0,
      sales: 0,
    };

    await db.insert(BottleUsage).values({
      ...bottleUsageData,
    });
  }

  await db.update(TotalBottles).set({
    damaged_bottles: totalBottles.damaged_bottles + data.damaged_bottles,
    available_bottles: totalBottles.available_bottles - data.damaged_bottles,
  });
}
