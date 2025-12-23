import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(null);
        }

        // Check if seller profile exists
        const sellerProfile = await prisma.sellerProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        });

        return NextResponse.json({
            ...session,
            user: {
                ...session.user,
                hasProfile: !!sellerProfile
            }
        });
    } catch (error) {
        console.error("Error in get-session route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
