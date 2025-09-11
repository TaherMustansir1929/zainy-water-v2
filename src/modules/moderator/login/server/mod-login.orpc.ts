import { os } from "@orpc/server";
import { z } from "zod";
import { db } from "@/db";
import { Moderator } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

// MOD MIDDLEWARE
export const modMiddleware = os
  .input(z.void())
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  )
  .handler(async () => {
    const moderator_id = (await cookies()).get("moderator_id")?.value;
    console.log({ moderator_id });

    if (!moderator_id)
      return { success: false, message: "Moderator ID not found in cookies" };

    // Try to get cached moderator session data first
    const cachedModerator = await redis.getValue(
      "session",
      "mod",
      moderator_id,
    );

    if (cachedModerator.success && cachedModerator.data) {
      const modData = cachedModerator.data as {
        isWorking: boolean;
        [key: string]: unknown;
      };

      if (!modData.isWorking) {
        console.log("Moderator is not working");
        return { success: false, message: "Moderator is not working" };
      }

      return { success: true, message: "Moderator is authorized" };
    }

    // If cache miss, check database and cache the result
    const [mod_db] = await db
      .select({
        id: Moderator.id,
        isWorking: Moderator.isWorking,
        name: Moderator.name,
        areas: Moderator.areas,
      })
      .from(Moderator)
      .where(eq(Moderator.id, moderator_id))
      .limit(1);

    if (!mod_db) {
      console.log("Moderator not found in database");
      return { success: false, message: "Moderator not found in database" };
    }

    // Cache moderator session data for future requests
    await redis.setValue("session", "mod", moderator_id, {
      id: mod_db.id,
      name: mod_db.name,
      areas: mod_db.areas,
      isWorking: mod_db.isWorking,
      loginTime: new Date().toISOString(),
    });

    if (!mod_db.isWorking) {
      console.log("Moderator is not working");
      return { success: false, message: "Moderator is not working" };
    }

    return { success: true, message: "Moderator is authorized" };
  });

// LOGIN ACTION
export const modLogin = os
  .input(
    z.object({
      name: z.string(),
      password: z.string(),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
      mod_data: z.union([z.custom<typeof Moderator.$inferSelect>(), z.null()]),
    }),
  )
  .handler(async ({ input }) => {
    const name = input.name.toLowerCase();
    const [mod_data] = await db
      .select()
      .from(Moderator)
      .where(
        and(eq(Moderator.name, name), eq(Moderator.password, input.password)),
      )
      .limit(1);

    if (!mod_data) {
      return { success: false, message: "Invalid credentials", mod_data: null };
    }

    if (!mod_data.isWorking) {
      return {
        success: false,
        message: "You are not a working moderator",
        mod_data: null,
      };
    }

    (await cookies()).set("moderator_id", mod_data.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    // Cache moderator session data
    await redis.setValue("session", "mod", mod_data.id, {
      id: mod_data.id,
      name: mod_data.name,
      areas: mod_data.areas,
      isWorking: mod_data.isWorking,
      loginTime: new Date().toISOString(),
    });

    return { success: true, message: "Login successful", mod_data };
  });

// CHECK LOGIN STATUS
export const modLoginStatus = os
  .input(z.void())
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  )
  .handler(async () => {
    try {
      const mod_id = (await cookies()).get("moderator_id");
      if (!mod_id?.value) {
        return { success: false, message: "Not logged in" };
      }

      // Try to get cached session data first
      const cachedSession = await redis.getValue(
        "session",
        "mod",
        mod_id.value,
      );

      if (cachedSession.success && cachedSession.data) {
        return {
          success: true,
          message: `Found moderator with id: ${mod_id.value}`,
        };
      }

      // If cache miss, check database and update cache
      const [mod_db] = await db
        .select()
        .from(Moderator)
        .where(eq(Moderator.id, mod_id.value))
        .limit(1);

      if (!mod_db) {
        return { success: false, message: "Moderator not found" };
      }

      // Cache the session data for future requests
      await redis.setValue("session", "mod", mod_id.value, {
        id: mod_db.id,
        name: mod_db.name,
        areas: mod_db.areas,
        isWorking: mod_db.isWorking,
        loginTime: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Found moderator with id: ${mod_id.value}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error checking login status ${error}`,
      };
    }
  });

// LOGOUT ACTION
export const modLogout = os
  .input(z.void())
  .output(z.void())
  .handler(async () => {
    const mod_id = (await cookies()).get("moderator_id");

    // Clear cached session data
    if (mod_id?.value) {
      await redis.deleteValue("session", "mod", mod_id.value);
    }

    (await cookies()).delete("moderator_id");
    console.log("Logout fn called successfully");
  });
