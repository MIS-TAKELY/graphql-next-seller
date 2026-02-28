// lib/notifications.ts
import { prisma } from "@/lib/db/prisma";
import { pusher } from "./realtime";

type NotificationType = "NEW_MESSAGE" | "NEW_ORDER" | "ORDER_STATUS" | "SYSTEM";

interface CreateNotificationInput {
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
    data?: Record<string, unknown>;
}

export async function createAndPushNotification({
    userId,
    title,
    body,
    type,
}: CreateNotificationInput) {
    // 1. Save to DB

    const notification = await prisma.notification.create({
        data: {
            userId,
            title,
            body,
            type,
        },
    });

    if (!notification) throw new Error("unable to send notofication");

    // 2. Push via Upstash Realtime (private channel per user)

    console.log(`user:${userId}`);
    // console.log("REALTIME INSTANCE (publisher):", realtime)
    try {
        await pusher.trigger(`user-${userId}`, "notification.newNotification", {
            id: notification.id,
            title,
            body,
            type,
            createdAt: notification.createdAt.toISOString(),
            isRead: false,
        });
    } catch (error) {
        console.error("Failed to push realtime notification:", error);
    }

    return notification;
}
