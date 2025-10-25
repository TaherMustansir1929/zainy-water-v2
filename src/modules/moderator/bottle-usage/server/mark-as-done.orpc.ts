import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { DEFAULT_TIMEZONE } from "@/lib/utils";
import { ORPCError, os } from "@orpc/server";
import { endOfDay, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { and, eq, gte, lte } from "drizzle-orm";
import z from "zod";

export const markAsDone = os
  .input(
    z.object({
      id: z.string(),
      done: z.boolean(),
      dob: z.date().nullable(),
    })
  )
  .output(z.void())
  .handler(async ({ input }) => {
    if (!input.dob) {
      throw new ORPCError("BAD_REQUEST: DOB is not provided");
    }

    // Convert the incoming date to Asia/Karachi timezone
    const tz_date = toZonedTime(input.dob, DEFAULT_TIMEZONE);

    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(
        and(
          eq(BottleUsage.moderator_id, input.id),
          gte(BottleUsage.createdAt, startOfDay(tz_date)),
          lte(BottleUsage.createdAt, endOfDay(tz_date))
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
