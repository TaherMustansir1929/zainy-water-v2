"use server";

import { db } from "@/db";
import { Customer, Delivery, Moderator } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { UpdateDailyDeliveryDataSchema } from "@/modules/admin/deliveries/server/updateDailyDelivey.orpc";

async function resetDeliveries(
  data: z.infer<typeof UpdateDailyDeliveryDataSchema>
) {
  // Update deliveries before September 14, 2025 without validation
  if (data.Delivery.createdAt < new Date("September 14, 2025")) {
    const valueDiffs = {
      foc: data.data.foc - data.Delivery.foc,
      payment: data.data.payment - data.Delivery.payment,
      filledBottles: data.data.filled_bottles - data.Delivery.filled_bottles,
      emptyBottles: data.data.empty_bottles - data.Delivery.empty_bottles,
    };

    const updatedData = {
      customer_balance:
        data.Customer.balance -
        valueDiffs.foc * data.Customer.bottle_price +
        valueDiffs.filledBottles * data.Customer.bottle_price -
        valueDiffs.payment,
      customer_bottles: data.Customer.bottles - valueDiffs.emptyBottles,
    };

    await db.transaction(async (tx) => {
      await Promise.all([
        tx
          .update(Customer)
          .set({
            balance: updatedData.customer_balance,
            bottles: updatedData.customer_bottles,
          })
          .where(eq(Customer.id, data.Customer.id)),

        tx
          .update(Delivery)
          .set({ ...data.data })
          .where(eq(Delivery.id, data.Delivery.id)),
      ]);
    });
    return {
      success: true,
      message: "Daily delivery updated successfully",
    };
  }
}

async function main() {
  const deliveries = await db
    .select()
    .from(Delivery)
    .innerJoin(Customer, eq(Delivery.customer_id, Customer.customer_id))
    .innerJoin(Moderator, eq(Delivery.moderator_id, Moderator.id))
    .orderBy(desc(Delivery.createdAt));

  const mutationData = {
    payment: 0,
    filled_bottles: 0,
    empty_bottles: 0,
    foc: 0,
    damaged_bottles: 0,
  };

  let index = 0;

  deliveries.forEach((d) => {
    if (d.Delivery.createdAt >= new Date("September 14, 2025")) return;
  });

  for (const delivery of deliveries) {
    console.log("Updating delivery", ++index, "of", deliveries.length);
    await resetDeliveries({
      ...delivery,
      data: mutationData,
    });
  }
}

await main();
console.log("Done!");
