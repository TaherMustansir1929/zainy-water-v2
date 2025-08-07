import { prisma } from "../prisma";
async function main() {
  try {
    const totalBottles = await prisma.totalBottles.create({
      data: {
        total_bottles: 1000,
        available_bottles: 1000,
      },
    });

    console.log({ totalBottles });
  } catch (error) {
    console.error("Error creating total bottles:", error);
  }
}

await main();
