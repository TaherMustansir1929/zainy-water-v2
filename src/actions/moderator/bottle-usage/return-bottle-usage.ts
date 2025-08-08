"use server";

import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { eq } from "drizzle-orm";

type DataProps = {
  moderator_id: string;
  empty_bottles: number;
  remaining_bottles: number;
  caps: number;
};

export async function returnBottleUsage(data: DataProps) {
  const [bottleUsage] = await db
    .select()
    .from(BottleUsage)
    .where(eq(BottleUsage.moderator_id, data.moderator_id))
    .limit(1);

  if (!bottleUsage) {
    throw new Error("Bottle usage not found");
  }

  if (
    bottleUsage.empty_bottles < data.empty_bottles ||
    bottleUsage.returned_bottles < data.remaining_bottles
  ) {
    throw new Error("Insufficient bottles to return");
  }

  if (bottleUsage.empty_bottles < data.empty_bottles) {
    throw new Error("Insufficient caps to return");
  }

  await db.update(BottleUsage).set({
    empty_bottles: bottleUsage.empty_bottles - data.empty_bottles,
    returned_bottles: bottleUsage.returned_bottles - data.remaining_bottles,
    caps: bottleUsage.caps - data.caps,
  });
}
