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
      sentAt: z.string(),
      sender: z.object({
        id: z.string(),
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        email: z.string(),
        role: z.enum(["BUYER", "SELLER", "ADMIN"]),
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
};

export const realtime = new Realtime({
  schema,
  redis,
  maxDurationSecs: 300,
});

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
