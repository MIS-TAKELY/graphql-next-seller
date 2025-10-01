import { prisma } from "@/lib/db/prisma";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request): Promise<NextResponse> {
  try {
    if (!WEBHOOK_SECRET) console.log("CLERK_WEBHOOK_SECRET not avilable");
    console.log("webhook secret-->", WEBHOOK_SECRET);

    const payload = await req.text();
    const rawHeaders = await headers();
    const headerPayload = Object.fromEntries(rawHeaders.entries());

    if (!WEBHOOK_SECRET) {
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

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const clerkId = evt.data.id;
      const email = evt.data.email_addresses?.[0]?.email_address ?? "";
      const role = "SELLER";
      const firstName = evt.data.first_name!;
      // const lastName = evt.data?.last_name;

      if (!email || !clerkId) {
        return new NextResponse("Missing email or Clerk ID", { status: 400 });
      }

      await prisma.user.upsert({
        where: { id: clerkId },
        update: { email, role },
        create: { clerkId, email, role, firstName },
      });

      // console.log(
      //   `[ClerkWebhook] Synced user: ${clerkId} (${email}, role: ${role})`
      // );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ClerkWebhook] Unexpected error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
