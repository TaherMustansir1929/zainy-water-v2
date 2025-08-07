import { prisma } from "../prisma";
async function main() {
  try {
    const bottleUsage = await prisma.bottleUsage.create({
      data: {
        moderator_id: "cme0am2340000111owz30z27j",
        filled_bottles: 100,
      },
    });

    console.log({ bottleUsage });
  } catch (error) {
    console.error("Error creating bottle usage:", error);
  }
}

await main();
