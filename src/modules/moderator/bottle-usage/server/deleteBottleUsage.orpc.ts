import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { DEFAULT_TIMEZONE } from "@/lib/utils";
import { ORPCError } from "@orpc/client";
import { os } from "@orpc/server";
import { endOfDay, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { and, eq, gte, lte } from "drizzle-orm";
import z from "zod";

export const deleteBottleUsage = os
  .input(
    z.object({
      dob: z.date(),
      moderator_id: z.string(),
    })
  )
  .output(z.void())
  .handler(async ({ input }) => {
    // Convert the incoming date to Asia/Karachi timezone
    const tz_date = toZonedTime(input.dob, DEFAULT_TIMEZONE);

    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(
        and(
          eq(BottleUsage.moderator_id, input.moderator_id),
          gte(BottleUsage.createdAt, startOfDay(tz_date)),
          lte(BottleUsage.createdAt, endOfDay(tz_date))
        )
      );

    if (!bottleUsage) {
      throw new ORPCError("Bottle usage record not found");
    }

    await db.delete(BottleUsage).where(eq(BottleUsage.id, bottleUsage.id));
  });
