"use server";

import { db } from "@/db";
import { Admin } from "@/db/schema";
import { dev_emails } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

export async function requestLicense(): Promise<{
  success: boolean;
  message: string;
  redirect: boolean;
}> {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const [admin] = await db
    .select()
    .from(Admin)
    .where(eq(Admin.clerk_id, user.id));
  if (!admin) {
    throw new Error("Admin record not found");
  }

  if (admin.isAuthorized) {
    (await cookies()).delete("license_key");
    (await cookies()).set("license_key", admin.clerk_id);
    return {
      success: true,
      message: "Admin already authorized",
      redirect: true,
    };
  } else {
    console.log("Sending license email....");
    await sendLicenseEmail({
      name: user.fullName || "Unknown Admin",
      email: user.emailAddresses[0].emailAddress || "Unknown Email",
      license_key: admin.clerk_id,
    });
    console.log("License email sent successfully.");
    return { success: true, message: "License request sent", redirect: false };
  }
}

export async function sendLicenseEmail({
  name,
  email,
  license_key,
}: {
  name: string;
  email: string;
  license_key: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: dev_emails,
    subject: `New Admin Login Request from ${name}`,
    html: `Name: ${name}<br />
    Email: ${email} <br/>
    New account is requesting access to the admin portal.<br />
    License Key: <strong>${license_key}</strong>`,
  });

  return { success: true };
}
