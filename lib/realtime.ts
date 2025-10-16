import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { z } from "zod";
import { redis } from "./redis"; // Ensure this is your Upstash Redis instance

// Expanded schema for chat events, aligned with Prisma Message model and resolver payload
// lib/realtime.ts
const schema = {
  notification: z.object({
    alert: z.string(),
  }),
  message: z.object({
    newMessage: z.object({
      id: z.string(),
      content: z
        .string()
        .nullable()
        .transform((val) => val || ""), // Handle null content
      type: z.enum(["TEXT", "IMAGE", "VIDEO", "SYSTEM"]),
      fileUrl: z.string().nullable().optional(),
      isRead: z.boolean(),
      clientId: z.string().optional(),
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
  }),
};

export const realtime = new Realtime({
  schema,
  redis,
  maxDurationSecs: 300, // Adjust if needed for long convos
});

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
