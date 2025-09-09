import { os } from "@orpc/server";
import { z } from "zod";
import { BottleUsage } from "@/db/schema";
import { db } from "@/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { startOfDay } from "date-fns";

export const getBottleUsage = os
  .input(z.object({ id: z.string().optional() }))
  .output(z.union([z.custom<typeof BottleUsage.$inferSelect>(), z.null()]))
  .handler(async ({ input }) => {
    if (!input.id) {
      throw new Error("Moderator ID is missing");
    }
    try {
      // First, try to get today's bottle usage
      const [bottleUsage] = await db
        .select()
        .from(BottleUsage)
        .where(
          and(
            eq(BottleUsage.moderator_id, input.id),
            gte(BottleUsage.createdAt, startOfDay(new Date())),
          ),
        )
        .orderBy(desc(BottleUsage.createdAt))
        .limit(1);

      if (bottleUsage) {
        return bottleUsage;
      }

      // If no record exists for today, create one
      // First get the most recent bottle usage to carry over remaining bottles
      const [previousBottleUsage] = await db
        .select()
        .from(BottleUsage)
        .where(eq(BottleUsage.moderator_id, input.id))
        .orderBy(desc(BottleUsage.createdAt))
        .limit(1);

      // Attempt to create new bottle usage record
      try {
        const [newBottleUsage] = await db
          .insert(BottleUsage)
          .values({
            moderator_id: input.id,
            filled_bottles: 0,
            empty_bottles: previousBottleUsage?.empty_bottles ?? 0,
            remaining_bottles: previousBottleUsage?.remaining_bottles ?? 0,
            caps: 0,
            sales: 0,
            returned_bottles: 0,
          })
          .returning();

        return newBottleUsage;
      } catch (insertError) {
        // If insert fails (possibly due to race condition), try to fetch again
        console.warn(
          "Insert failed, attempting to fetch existing record:",
          insertError,
        );

        const [existingUsage] = await db
          .select()
          .from(BottleUsage)
          .where(
            and(
              eq(BottleUsage.moderator_id, input.id),
              gte(BottleUsage.createdAt, startOfDay(new Date())),
            ),
          )
          .orderBy(desc(BottleUsage.createdAt))
          .limit(1);

        if (existingUsage) {
          return existingUsage;
        }

        // If we still can't find a record, re-throw the original error
        throw insertError;
      }
    } catch (error) {
      console.error("Error fetching bottle usage:", error);
      // Re-throw the error so React Query can handle it properly
      // This allows you to distinguish between errors and null data in your UI
      throw new Error(
        `Failed to fetch bottle usage for moderator ${input.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
