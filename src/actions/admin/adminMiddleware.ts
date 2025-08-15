import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Admin } from "@/db/schema";
import { eq } from "drizzle-orm";

export const adminMiddleware = async (): Promise<{
  status: number;
  message: string;
}> => {
  "use server";

  try {
    const user = await currentUser();

    if (!user) {
      return { status: 401, message: "Unauthorized" };
    }

    const [admin] = await db
      .select()
      .from(Admin)
      .where(eq(Admin.clerk_id, user.id))
      .limit(1);

    if (!!admin) {
      return { status: 200, message: "Admin already exists" };
    }

    await db.insert(Admin).values({
      clerk_id: user.id,
    });

    console.log("Admin created successfully");
    return { status: 201, message: "Admin created successfully" };
  } catch (error) {
    console.error("Error creating admin:", error);
    return { status: 500, message: "Internal server error" };
  }
};
