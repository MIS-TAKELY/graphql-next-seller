// app/api/webhook/clerk/route.ts
import { prisma } from "@/lib/db/prisma";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const payload = await req.text();
    const rawHeaders = await headers();
    const headerPayload = Object.fromEntries(rawHeaders.entries());

    if (!WEBHOOK_SECRET) {
      console.error("CLERK_WEBHOOK_SECRET is missing!");
      return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, headerPayload) as WebhookEvent;
    } catch (error) {
      console.error("[ClerkWebhook] Verification failed:", error);
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // Handle user creation or update from Clerk
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const clerkId = evt.data.id;
      const email = evt.data.email_addresses?.[0]?.email_address ?? "";
      const firstName = evt.data.first_name ?? null;
      const lastName = evt.data.last_name ?? null;
      const avatarImageUrl = evt.data.image_url ?? null;
      const phone = evt.data.phone_numbers?.[0]?.phone_number ?? null;

      if (!clerkId || !email) {
        return new NextResponse("Missing clerkId or email", { status: 400 });
      }

      // Step 1: Upsert the core User record (no role field anymore!)
      const user = await prisma.user.upsert({
        where: { clerkId },
        update: {
          email,
          firstName,
          lastName,
          avatarImageUrl,
          phone,
        },
        create: {
          clerkId,
          email,
          firstName,
          lastName,
          avatarImageUrl,
          phone,
          // No role here — roles are managed separately
        },
      });

      // Step 2: Ensure the user has the BUYER role by default
      // (Only adds it if not already present)
      await prisma.userRole.upsert({
        where: {
          userId_role: {
            userId: user.id,
            role: "BUYER",
          },
        },
        update: {},
        create: {
          userId: user.id,
          role: "BUYER",
        },
      });

      console.log(
        `[ClerkWebhook] Synced user: ${email} (ID: ${user.id}) → Granted BUYER role`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ClerkWebhook] Unexpected error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
