"use server";

import {
  Area,
  BottleUsage,
  Customer,
  Delivery,
  TotalBottles,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";

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
      delivery?: Delivery;
      customer: Customer;
      bottleUsage: BottleUsage;
      totalBottles: TotalBottles;
    }
  | { success: false; error: string }
> {
  try {
    const newDeliveryRecord = await prisma.delivery.create({
      data: {
        customer_id: data.customer_id,
        moderator_id: data.moderator_id,
        delivery_date: data.delivery_date,
        payment: data.payment,
        filled_bottles: data.filled_bottles,
        empty_bottles: data.empty_bottles,
        foc: data.foc,
        damaged_bottles: data.damaged_bottles,
      },
    });

    const updatedCustomer = await prisma.customer.update({
      where: {
        customer_id: data.customer_id,
      },
      data: {
        balance: data.balance,
        bottles: data.customer_bottles,
      },
    });

    const bottleUsage = await prisma.bottleUsage.findFirst({
      where: {
        moderator_id: data.moderator_id,
        createdAt: { lte: data.delivery_date },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!bottleUsage)
      return { success: false, error: "Bottle usage record not found." };

    const updatedSales = bottleUsage.sales + data.filled_bottles;

    const updatedBottleUsage = await prisma.bottleUsage.update({
      where: {
        id: bottleUsage.id,
      },
      data: {
        sales: updatedSales,
        empty_bottles: bottleUsage.empty_bottles + data.empty_bottles,
        returned_bottles: bottleUsage.filled_bottles - updatedSales,
      },
    });

    const totalBottles = await prisma.totalBottles.findFirst();

    if (!totalBottles)
      return { success: false, error: "Total bottles record not found." };

    const updatedTotalBottles = await prisma.totalBottles.update({
      where: { id: totalBottles.id },
      data: {
        damaged_bottles: totalBottles.damaged_bottles + data.damaged_bottles,
      },
    });

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
): Promise<Delivery[] | null> {
  const data = await prisma.delivery.findMany({
    where: {
      moderator_id: moderator_id,
      delivery_date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
      },
    },
    orderBy: { delivery_date: "desc" }, // Order by delivery date descending
  });

  return data;
}

export async function getCustomerDataById(
  customer_id: string,
  areas: Area[]
): Promise<
  { success: true; data: Customer } | { success: false; error: string }
> {
  try {
    if (!areas || areas.length === 0) {
      return {
        success: false,
        error: "No areas provided for customer lookup.",
      };
    }

    // Fetch customer data based on customer_id and areas
    const data = await prisma.customer.findUnique({
      where: {
        customer_id: customer_id,
      },
    });

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
