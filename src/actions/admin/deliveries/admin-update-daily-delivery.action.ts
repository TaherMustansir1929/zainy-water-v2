"use server";

import { db } from "@/db";
import {
  BottleUsage,
  Customer,
  Delivery,
  Moderator,
  TotalBottles,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type UpdateDailyDeliveryDataProps = {
  Delivery: typeof Delivery.$inferSelect;
  Moderator: typeof Moderator.$inferSelect;
  Customer: typeof Customer.$inferSelect;
  data: {
    payment: number;
    filled_bottles: number;
    empty_bottles: number;
    foc: number;
    damaged_bottles: number;
  };
};

export async function updateDailyDelivery(
  data: UpdateDailyDeliveryDataProps,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(eq(BottleUsage.moderator_id, data.Moderator.id))
      .orderBy(desc(BottleUsage.createdAt))
      .limit(1);

    if (!bottleUsage) {
      throw new Error("Bottle usage not found");
    }

    const [totalBottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt))
      .limit(1);

    if (!totalBottles) {
      throw new Error("Total bottles not found");
    }

    const valueDiffs = {
      filledBottles: data.data.filled_bottles - data.Delivery.filled_bottles,
      emptyBottles: data.data.empty_bottles - data.Delivery.empty_bottles,
      damagedBottles: data.data.damaged_bottles - data.Delivery.damaged_bottles,
      foc: data.data.foc - data.Delivery.foc,
      payment: data.data.payment - data.Delivery.payment,
    };

    const updatedData = {
      sales: bottleUsage.sales + valueDiffs.filledBottles,
      remainingBottles:
        bottleUsage.remaining_bottles - valueDiffs.filledBottles,
      emptyBottles: bottleUsage.empty_bottles + valueDiffs.emptyBottles,
      damagedBottles: totalBottles.damaged_bottles + valueDiffs.damagedBottles,
      availableBottles:
        totalBottles.available_bottles - valueDiffs.damagedBottles,
      payment: data.Delivery.payment + valueDiffs.payment,
      customer_balance:
        data.Customer.balance -
        valueDiffs.foc * data.Customer.bottle_price -
        valueDiffs.payment,
      customer_bottles: data.Customer.bottles - valueDiffs.emptyBottles,
    };

    Object.entries(updatedData).forEach(([key, value]) => {
      if (key === "customer_balance") return;
      if (value < 0) {
        throw new Error(`Invalid ${key} value: ${value}`);
      }
    });

    // Update customer, bottle usage, and total bottles
    await db
      .update(Customer)
      .set({
        balance: updatedData.customer_balance,
        bottles: updatedData.customer_bottles,
      })
      .where(eq(Customer.id, data.Customer.id));

    await db
      .update(BottleUsage)
      .set({
        sales: updatedData.sales,
        remaining_bottles: updatedData.remainingBottles,
        empty_bottles: updatedData.emptyBottles,
      })
      .where(eq(BottleUsage.id, bottleUsage.id));

    await db
      .update(TotalBottles)
      .set({
        damaged_bottles: updatedData.damagedBottles,
        available_bottles: updatedData.availableBottles,
      })
      .where(eq(TotalBottles.id, totalBottles.id));

    // Update actual delivery
    await db
      .update(Delivery)
      .set({
        ...data.data,
      })
      .where(eq(Delivery.id, data.Delivery.id));

    return {
      success: true,
      message: "Daily delivery updated successfully",
    };
  } catch (error) {
    console.error("Error updating daily delivery:", error);
    throw error;
  }
}
