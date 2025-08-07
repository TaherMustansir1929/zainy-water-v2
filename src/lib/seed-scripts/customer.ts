import { prisma } from "../prisma";
async function main() {
  try {
    const data = await prisma.customer.create({
      data: {
        customer_id: "abcd",
        name: "Taher",
        address: "123 Main St",
        area: "Saddar",
        phone: "1234567890",
        bottle_price: 100,
        bottles: 5,
        deposit: 5,
        balance: 500,
      },
    });

    console.log("Customer created:", data);
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

await main();
