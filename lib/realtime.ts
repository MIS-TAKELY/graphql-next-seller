// lib/realtime.ts (shared between both apps)
import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { z } from "zod";
import { redis } from "./redis";

const orderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]);

const schema = {
  message: {
    newMessage: z.object({
      id: z.string(),
      conversationId: z.string(),
      content: z.string().nullable(),
      type: z.enum(["TEXT", "IMAGE", "VIDEO", "SYSTEM"]),
      clientId: z.string().optional(),
      fileUrl: z.string().nullable().optional(),
      isRead: z.boolean(),
      sentAt: z.date(),
      sender: z.object({
        id: z.string(),
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        email: z.string(),
        roles: z.array(
          z.object({ role: z.enum(["BUYER", "SELLER", "ADMIN"]) })
        ),
      }),
      attachments: z
        .array(
          z.object({
            id: z.string(),
            url: z.string(),
            type: z.enum(["IMAGE", "VIDEO"]),
          })
        )
        .optional(),
    }),
  },

  notification: {
    newNotification: z.object({
      id: z.string(),
      title: z.string(),
      body: z.string(),
      type: z.string(),
      data: z.record(z.string(), z.any()).nullable(),
      createdAt: z.string(),
      isRead: z.boolean(),
    }),
  },

  order: {
    newOrder: z.object({
      sellerId: z.string(),
      sellerOrderId: z.string(),
      buyerOrderId: z.string(),
      status: orderStatusEnum,
      total: z.number(),
      createdAt: z.string(),
      customerName: z.string().optional(),
      summary: z.string().optional(),
    }),
    statusChanged: z.object({
      sellerId: z.string(),
      sellerOrderId: z.string(),
      buyerOrderId: z.string(),
      status: orderStatusEnum,
      previousStatus: orderStatusEnum,
      total: z.number(),
      updatedAt: z.string(),
    }),
  },

  faq: {
    newQuestion: z.object({
      id: z.string(),
      productId: z.string(),
      content: z.string(),
      createdAt: z.string().or(z.date()),
      user: z.object({
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
      }),
    }),
    newAnswer: z.object({
      id: z.string(),
      questionId: z.string(),
      content: z.string(),
      createdAt: z.string().or(z.date()),
      seller: z.object({
        shopName: z.string(),
      }),
    }),
  },
};

export const realtime = new Realtime({
  schema,
  redis,
  maxDurationSecs: 300,
});

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;

// Export individual payload types for convenience
export type NewMessagePayload = z.infer<typeof schema.message.newMessage>;
export type NewNotificationPayload = z.infer<
  typeof schema.notification.newNotification
>;
export type NewOrderPayload = z.infer<typeof schema.order.newOrder>;
export type OrderStatusChangedPayload = z.infer<
  typeof schema.order.statusChanged
>;

export type NewQuestionPayload = z.infer<typeof schema.faq.newQuestion>;
export type NewAnswerPayload = z.infer<typeof schema.faq.newAnswer>;
