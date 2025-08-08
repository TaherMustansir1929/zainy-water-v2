"use server";

import { db } from "@/db";
import { BottleUsage, TotalBottles } from "@/db/schema";
import { startOfDay } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";

type DataProp = {
  moderator_id: string;
  filled_bottles: number;
  caps: number;
};

//TODO: Add moderator validation before every database mutation

export async function modAddUpdateBottleUsage(
  data: DataProp
): Promise<{ success: boolean }> {
  const [total_bottles] = await db
    .select()
    .from(TotalBottles)
    .orderBy(desc(TotalBottles.createdAt))
    .limit(1);

  if (total_bottles.available_bottles < data.filled_bottles) {
    throw new Error("Filled_bottles cannot exceed total available bottles");
  }

  const [bottleUsage] = await db
    .select()
    .from(BottleUsage)
    .orderBy(desc(BottleUsage.createdAt))
    .where(
      and(
        eq(BottleUsage.moderator_id, data.moderator_id),
        lte(BottleUsage.createdAt, new Date()),
        gte(BottleUsage.createdAt, startOfDay(new Date()))
      )
    )
    .limit(1);

  if (!!bottleUsage) {
    await db
      .update(BottleUsage)
      .set({
        filled_bottles: bottleUsage.filled_bottles + data.filled_bottles,
        returned_bottles: bottleUsage.returned_bottles + data.filled_bottles,
        caps: bottleUsage.caps + data.caps,
      })
      .where(eq(BottleUsage.id, bottleUsage.id));

    await db.update(TotalBottles).set({
      available_bottles: total_bottles.available_bottles - data.filled_bottles,
      used_bottles: total_bottles.used_bottles + data.filled_bottles,
    });

    return { success: true };
  } else {
    await db.insert(BottleUsage).values({
      moderator_id: data.moderator_id,
      filled_bottles: data.filled_bottles,
      returned_bottles: data.filled_bottles,
      caps: data.caps,
    });

    await db.update(TotalBottles).set({
      available_bottles: total_bottles.available_bottles - data.filled_bottles,
      used_bottles: total_bottles.used_bottles + data.filled_bottles,
    });

    return { success: true };
  }
}
