import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164 format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
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
      where: { phone },
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
        phone,
        otpExpiresAt: expiresAt,
      },
    });

    // Send OTP via WhatsApp
    await sendWhatsAppMessage(phone, otp);

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
