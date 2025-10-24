import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { ORPCError, os } from "@orpc/server";
import { endOfDay, startOfDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import z from "zod";

export const markAsDone = os
  .input(
    z.object({
      id: z.string(),
      done: z.boolean(),
      dob: z.date(),
    })
  )
  .output(z.void())
  .handler(async ({ input }) => {
    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(
        and(
          eq(BottleUsage.moderator_id, input.id),
          gte(BottleUsage.createdAt, startOfDay(input.dob)),
          lte(BottleUsage.createdAt, endOfDay(input.dob))
        )
      );

    if (!bottleUsage) {
      throw new ORPCError("No bottle usage found for today");
    }

    if (bottleUsage.done === input.done) {
      throw new ORPCError("Bottle usage is already in the desired state");
    }

    await db
      .update(BottleUsage)
      .set({ done: input.done })
      .where(eq(BottleUsage.id, bottleUsage.id));
  });
