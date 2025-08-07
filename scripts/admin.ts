import { db } from "@/db";
import { Admin } from "@/db/schema";

async function main() {
  try {
    const admin = await db
      .insert(Admin)
      .values({
        name: "Taher",
        password: "5555",
      })
      .returning();

    console.log("Admin created:", admin);
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

await main();
