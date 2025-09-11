import { z } from "zod";
import { adminProcedure } from "@/middlewares/admin-clerk";
import { db } from "@/db";
import { OtherExpense } from "@/db/schema";
import { eq } from "drizzle-orm";

export const UpdateOtherExpenseDataSchema = z.object({
  other_exp_id: z.string(),
  data: z.object({
    amount: z.number(),
    description: z.string(),
    refilled_bottles: z.number(),
  }),
});

export const updateOtherExpense = adminProcedure
  .input(UpdateOtherExpenseDataSchema)
  .output(z.void())
  .handler(async ({ input }) => {
    try {
      await db
        .update(OtherExpense)
        .set({
          ...input.data,
        })
        .where(eq(OtherExpense.id, input.other_exp_id));
    } catch (error) {
      console.error("Error updating other expense record", { error });
      throw error;
    }
  });
