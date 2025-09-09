import { db } from "@/db";
import { BottleUsage, TotalBottles } from "@/db/schema";
import { os } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import z from "zod";

export const returnBottleUsage = os
  .input(
    z.object({
      moderator_id: z.string(),
      empty_bottles: z.number().min(0, "Empty bottles must be non-negative"),
      remaining_bottles: z
        .number()
        .min(0, "Remaining bottles must be non-negative"),
      caps: z.number().min(0, "Caps must be non-negative"),
    })
  )
  .output(z.void())
  .errors({
    BOTTLE_USAGE_404: {
      status: 404,
      message: "Bottle usage record not found for this moderator",
    },
    TOTAL_BOTTLES_404: {
      status: 404,
      message: "Total bottles record not found",
    },
    INSUFFICIENT_BOTTLES: {
      status: 400,
      message: "Insufficient bottles to return",
    },
    INSUFFICIENT_CAPS: {
      status: 400,
      message: "Insufficient caps to return",
    },
  })
  .handler(async ({ input, errors }) => {
    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(eq(BottleUsage.moderator_id, input.moderator_id))
      .orderBy(desc(BottleUsage.createdAt))
      .limit(1);

    if (!bottleUsage) {
      throw errors.BOTTLE_USAGE_404();
    }

    // Check if moderator has enough bottles and caps to return
    if (
      bottleUsage.empty_bottles < input.empty_bottles ||
      bottleUsage.remaining_bottles < input.remaining_bottles
    ) {
      throw errors.INSUFFICIENT_BOTTLES();
    }

    if (bottleUsage.caps < input.caps) {
      throw errors.INSUFFICIENT_CAPS();
    }

    const [totalBottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt))
      .limit(1);

    if (!totalBottles) {
      throw errors.TOTAL_BOTTLES_404();
    }

    await db.transaction(async (tx) => {
      await Promise.all([
        // Update TotalBottles
        tx
          .update(TotalBottles)
          .set({
            available_bottles:
              totalBottles.available_bottles +
              input.empty_bottles +
              input.remaining_bottles,
            used_bottles:
              totalBottles.used_bottles -
              input.empty_bottles -
              input.remaining_bottles,
          })
          .where(eq(TotalBottles.id, totalBottles.id)),

        // Update BottleUsage
        tx
          .update(BottleUsage)
          .set({
            empty_bottles: bottleUsage.empty_bottles - input.empty_bottles,
            remaining_bottles:
              bottleUsage.remaining_bottles - input.remaining_bottles,
            returned_bottles:
              bottleUsage.returned_bottles +
              input.remaining_bottles +
              input.empty_bottles,
            caps: bottleUsage.caps - input.caps,
          })
          .where(eq(BottleUsage.id, bottleUsage.id)),
      ]);
    });
  });
