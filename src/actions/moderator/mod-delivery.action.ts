"use server";

import { db } from "@/db";
import {
  BottleUsage,
  Customer,
  Delivery,
  TotalBottles,
  Area,
} from "../../db/schema";
import { and, desc, eq, lte, gte } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

export type DeliveryRecord = {
  filled_bottles: number;
  empty_bottles: number;
  foc: number;
  damaged_bottles: number;

  customer_id: string;
  balance: number;
  customer_bottles: number;

  payment: number;
  moderator_id: string;
  delivery_date: Date;
};

export async function addDailyDeliveryRecord(data: DeliveryRecord): Promise<
  | {
      success: true;
      delivery?: typeof Delivery.$inferSelect;
      customer: typeof Customer.$inferSelect;
      bottleUsage: typeof BottleUsage.$inferSelect;
      totalBottles: typeof TotalBottles.$inferSelect;
    }
  | { success: false; error: string }
> {
  try {
    const [bottleUsage] = await db
      .select()
      .from(BottleUsage)
      .where(
        and(
          eq(BottleUsage.moderator_id, data.moderator_id),
          gte(BottleUsage.createdAt, startOfDay(data.delivery_date)),
          lte(BottleUsage.createdAt, endOfDay(data.delivery_date))
        )
      )
      .orderBy(desc(BottleUsage.createdAt))
      .limit(1);

    const [totalBottles] = await db
      .select()
      .from(TotalBottles)
      .orderBy(desc(TotalBottles.createdAt))
      .limit(1);

    if (!bottleUsage)
      return { success: false, error: "Bottle usage record not found." };

    if (!totalBottles) {
      return { success: false, error: "Total bottles record not found." };
    }

    const updatedSales = bottleUsage.sales + data.filled_bottles;

    if (bottleUsage.remaining_bottles < data.filled_bottles) {
      return { success: false, error: "Insufficient bottles to sale." };
    }

    const [updatedCustomer] = await db
      .update(Customer)
      .set({
        balance: data.balance,
        bottles: data.customer_bottles,
      })
      .where(eq(Customer.customer_id, data.customer_id))
      .returning();

    const [updatedBottleUsage] = await db
      .update(BottleUsage)
      .set({
        sales: updatedSales,
        empty_bottles: bottleUsage.empty_bottles + data.empty_bottles,
        remaining_bottles: bottleUsage.remaining_bottles - data.filled_bottles,
      })
      .where(eq(BottleUsage.id, bottleUsage.id))
      .returning();

    const [updatedTotalBottles] = await db
      .update(TotalBottles)
      .set({
        damaged_bottles: totalBottles.damaged_bottles + data.damaged_bottles,
        available_bottles:
          totalBottles.available_bottles - data.damaged_bottles,
      })
      .where(eq(TotalBottles.id, totalBottles.id))
      .returning();

    const [newDeliveryRecord] = await db
      .insert(Delivery)
      .values({
        customer_id: data.customer_id,
        moderator_id: data.moderator_id,
        delivery_date: data.delivery_date,
        payment: data.payment,
        filled_bottles: data.filled_bottles,
        empty_bottles: data.empty_bottles,
        foc: data.foc,
        damaged_bottles: data.damaged_bottles,
      })
      .returning();

    return {
      success: true,
      delivery: newDeliveryRecord,
      customer: updatedCustomer,
      bottleUsage: updatedBottleUsage,
      totalBottles: updatedTotalBottles,
    };
  } catch (error) {
    console.error("Error adding daily delivery record:", error);
    return {
      success: false,
      error: `Error adding daily delivery record: ${error}`,
    };
  }
}

export async function getDailyDeliveryRecords(
  moderator_id: string
): Promise<(typeof Delivery.$inferSelect)[] | null> {
  const data = await db
    .select()
    .from(Delivery)
    .where(
      and(
        eq(Delivery.moderator_id, moderator_id),
        gte(Delivery.delivery_date, startOfDay(new Date())),
        lte(Delivery.delivery_date, endOfDay(new Date()))
      )
    )
    .orderBy(desc(Delivery.createdAt));

  return data;
}

export async function getCustomerDataById(
  customer_id: string,
  areas: (typeof Area.enumValues)[number][]
): Promise<
  | { success: true; data: typeof Customer.$inferSelect }
  | { success: false; error: string }
> {
  try {
    if (!areas || areas.length === 0) {
      return {
        success: false,
        error: "No areas provided for customer lookup.",
      };
    }

    // Fetch customer data based on customer_id and areas
    const [data] = await db
      .select()
      .from(Customer)
      .where(eq(Customer.customer_id, customer_id))
      .limit(1);

    if (!data) {
      return { success: false, error: "Customer not found." };
    }

    if (data.isActive === false) {
      return { success: false, error: "Customer is not active." };
    }

    if (!areas.includes(data.area)) {
      return { success: false, error: "Customer area is not authorized." };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return { success: false, error: "Error fetching customer data." };
  }
}
