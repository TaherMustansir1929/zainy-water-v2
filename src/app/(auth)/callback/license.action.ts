"use server";

import { db } from "@/db";
import { Admin } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function checkLicenseKey(
  licenseKey: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const user = await currentUser();

  if (!user) {
    return { success: false, error: "User not found" };
  }

  licenseKey = licenseKey.trim();

  try {
    const [admin] = await db
      .select()
      .from(Admin)
      .where(eq(Admin.clerk_id, user.id))
      .limit(1);

    if (!admin) {
      return { success: false, error: "Admin record not found" };
    }

    if (admin.clerk_id === licenseKey) {
      await db
        .update(Admin)
        .set({ isAuthorized: true })
        .where(eq(Admin.id, admin.id));

      (await cookies()).delete("license_key");
      (await cookies()).set("license_key", admin.clerk_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      });

      return { success: true, message: "Authorization successful" };
    } else {
      return { success: false, error: "Authorization failed" };
    }
  } catch (error) {
    console.log({ success: false, error });
    throw error;
  }
}
