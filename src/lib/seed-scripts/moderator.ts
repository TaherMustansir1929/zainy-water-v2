import { prisma } from "../prisma";

async function main() {
  try {
    const data = await prisma.moderator.create({
      data: {
        name: "Khan",
        password: "1234",
        areas: ["Saddar", "Nazimabad", "Gulshan"],
      },
    });

    console.log("Moderator created:", data);
  } catch (error) {
    console.error("Error creating moderator:", error);
  }
}

await main();
