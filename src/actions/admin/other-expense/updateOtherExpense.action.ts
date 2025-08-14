"use server";

import { db } from "@/db";
import { OtherExpense } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UpdateOtherExpenseDataProps = {
  other_exp_id: string;
  data: {
    amount: number;
    description: string;
  }
}

export async function updateOtherExpense(data: UpdateOtherExpenseDataProps) {
  try {
    await db.update(OtherExpense).set({
      ...data.data,
    }).where(eq(OtherExpense.id, data.other_exp_id))
  } catch (error) {
    console.error("Error updating other expense record", { error })
    throw error;
  }
}
