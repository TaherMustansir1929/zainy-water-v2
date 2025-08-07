import { prisma } from "../prisma";

async function main() {
  try {
    const data = await prisma.admin.create({
      data: {
        name: "Taher",
        password: "5555",
      },
    });

    console.log("Admin created:", data);
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

await main();
