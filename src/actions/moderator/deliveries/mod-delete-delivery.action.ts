"use server";

import { DeliveryTableData } from "@/app/(mod)/moderator/daily-delivery/daily-delivery-table";
import { db } from "@/db";
import { BottleUsage, Customer, Delivery, TotalBottles } from "@/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { format, startOfDay } from "date-fns";
import { sendWhatsAppMessage } from "./mod-whatsapp-automation";

export type DeleteDeliveryDataProp = {
  data: DeliveryTableData;
  moderator_id: string;
};

export async function deleteDailyDelivery(data: DeleteDeliveryDataProp) {
  try {
    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(
        and(
          eq(BottleUsage.moderator_id, data.moderator_id),
          gte(BottleUsage.createdAt, startOfDay(new Date()))
        )
      )
      .orderBy(desc(BottleUsage.createdAt))
      .limit(1);

    if (!bottleUsage) {
      throw new Error("Bottle usage not found");
    }

    await db
      .update(BottleUsage)
      .set({
        sales: bottleUsage.sales - data.data.delivery.filled_bottles,
        remaining_bottles:
          bottleUsage.remaining_bottles + data.data.delivery.filled_bottles,
        empty_bottles:
          bottleUsage.empty_bottles - data.data.delivery.empty_bottles,
      })
      .where(eq(BottleUsage.id, bottleUsage.id));

    const [totalBottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt))
      .limit(1);

    if (!totalBottles) {
      throw new Error("Total bottles not found");
    }

    await db
      .update(TotalBottles)
      .set({
        damaged_bottles:
          totalBottles.damaged_bottles - data.data.delivery.damaged_bottles,
      })
      .where(eq(TotalBottles.id, totalBottles.id));

    await db
      .update(Customer)
      .set({
        bottles:
          data.data.customer.bottles +
          data.data.delivery.empty_bottles -
          data.data.delivery.filled_bottles,
        balance:
          data.data.customer.balance +
          data.data.delivery.payment -
          (data.data.delivery.filled_bottles - data.data.delivery.foc) *
            data.data.customer.bottle_price,
      })
      .where(eq(Customer.id, data.data.customer.id));

    await db.delete(Delivery).where(eq(Delivery.id, data.data.delivery.id));

    await sendWhatsAppMessage(
      data.data.customer.phone,
      `\`\`\`⚠️ NOTE: The delivery made at\`\`\` *_${format(data.data.delivery.createdAt, "hh:mm aaaa PPPP")}_* \`\`\`has been deleted.
Short Delivery Details:
- Customer: ${data.data.customer.name}
- Filled Bottles: ${data.data.delivery.filled_bottles}
- Empty Bottles: ${data.data.delivery.empty_bottles}
- Payment: ${data.data.delivery.payment}

Sorry for the inconvenience.\`\`\``
    );
  } catch (error) {
    console.error("Error deleting delivery:", error);
    throw error;
  }
}
