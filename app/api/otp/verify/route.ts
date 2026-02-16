import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/services/rateLimit.service";

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed = await rateLimit(`rl:otp-verify:${session.user.id}`, 5, 300);
    if (!allowed) {
        return NextResponse.json({ error: "Too many verification attempts. Please wait before trying again." }, { status: 429 });
    }

    try {
        const { otp } = await req.json();
        if (!otp) {
            return NextResponse.json({ error: "OTP is required" }, { status: 400 });
        }

        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json({ error: "OTP must be a 6-digit number" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { otp: true, otpExpiresAt: true },
        });

        if (!user || !user.otp || user.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
        }

        // Verify phone and clear OTP
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                phoneNumberVerified: true,
                otp: null,
                otpExpiresAt: null
            },
        });

        // Revalidate the cache to ensure session is updated
        revalidatePath('/');

        return NextResponse.json({ success: true, message: "Phone verified successfully" });
    } catch (error: any) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json({ error: error.message || "Failed to verify OTP" }, { status: 500 });
    }
}
