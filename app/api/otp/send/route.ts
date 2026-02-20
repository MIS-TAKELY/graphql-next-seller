import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/services/rateLimit.service";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await rateLimit(`rl:otp-send:${session.user.id}`, 3, 300);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many OTP requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(phone.replace(/\s|-/g, ""))) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number format. Please use international format (e.g., +9779812345678)",
        },
        { status: 400 }
      );
    }

    // Check if phone number is already registered to another user
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: phone },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        {
          error: "This phone number is already registered to another account",
        },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Save OTP and phone to user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        otp,
        phoneNumber: phone,
        otpExpiresAt: expiresAt,
      },
    });
    const message = `Your verification code is: ${otp}. ⚠️ Do not share this code with anyone. Vanijay will never ask you for this code. This code expires in 10 minutes.`;
    // Send OTP via WhatsApp
    await sendWhatsAppMessage(phone, message);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
