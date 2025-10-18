import { db } from "@/db";
import { BottleUsage } from "@/db/schema";
import { ORPCError } from "@orpc/client";
import { os } from "@orpc/server";
import { endOfDay, startOfDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import z from "zod";

export const deleteBottleUsage = os
  .input(
    z.object({
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
          gte(BottleUsage.createdAt, startOfDay(input.dob)),
          lte(BottleUsage.createdAt, endOfDay(input.dob))
        )
      );

    if (!bottleUsage) {
      throw new ORPCError("Bottle usage record not found");
    }

    await db.delete(BottleUsage).where(eq(BottleUsage.id, bottleUsage.id));
  });
