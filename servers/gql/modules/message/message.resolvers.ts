// servers/gql/messageResolvers.ts
import type { FileType as PrismaFileType } from "@/app/generated/prisma";
import { createAndPushNotification } from "@/lib/notification";
import { NewMessagePayload, pusher } from "@/lib/realtime";
import type {
  FileType as CustomerFileType,
  MessageType,
} from "@/types/customer/customer.types";
import type { GraphQLContext, SendMessageInput } from "../../types";

const toPrismaFileType = (type: CustomerFileType): PrismaFileType => {
  const normalized = type.toUpperCase();
  if (normalized === "IMAGE" || normalized === "VIDEO") {
    return normalized as PrismaFileType;
  }

  throw new Error(
    `Unsupported attachment type: ${type}. Only IMAGE or VIDEO are allowed.`
  );
};

export const messageResolvers = {
  Query: {
    messages: async (
      _parent: unknown,
      {
        conversationId,
        limit = 50,
        offset = 0,
      }: { conversationId: string; limit?: number; offset?: number },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) {
        throw new Error("Unauthorized: User must be logged in.");
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { senderId: true, recieverId: true },
      });

      if (!conversation) {
        throw new Error("Conversation not found.");
      }

      const isParticipant =
        conversation.senderId === user.id ||
        conversation.recieverId === user.id;

      if (!isParticipant) {
        throw new Error("Unauthorized: You are not a participant.");
      }

      const messages = await prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              roles: {
                select: {
                  role: true,
                },
              },
            },
          },
          MessageAttachment: true,
        },
        orderBy: { sentAt: "desc" }, // Get latest messages first
        skip: offset,
        take: limit,
      });

      // Reverse to maintain chronological order (oldest to newest) for display
      // Map to match GraphQL schema field names
      return messages.reverse().map((msg) => ({
        ...msg,
        attachments: msg.MessageAttachment || [],
      }));
    },
  },
  Mutation: {
    sendMessage: async (
      _parent: unknown,
      { input }: { input: SendMessageInput },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) {
        throw new Error("Unauthorized: User must be logged in.");
      }
      console.log("recieved in backend")
      const {
        conversationId,
        content,
        clientId,
        type,
        attachments = [],
      } = input;
      const startTime = Date.now();
      console.log(`[SELLER-BACKEND] 🚀 sendMessage started at ${new Date().toISOString()}`);

      const prismaType = (type?.toUpperCase() as MessageType) ?? "TEXT";

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          sender: { select: { id: true } },
          reciever: { select: { id: true } },
          ConversationParticipant: {
            select: {
              user: { select: { id: true } },
            },
          },
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found.");
      }

      const isParticipant =
        conversation.senderId === user.id ||
        conversation.recieverId === user.id;
      if (!isParticipant) {
        throw new Error("Unauthorized: You are not a participant.");
      }

      const result = await prisma.$transaction(async (tx) => {
        const message = await tx.message.create({
          data: {
            conversationId,
            senderId: user.id,
            content: content || null,
            type: prismaType,
            clientId,
            fileUrl: attachments.length > 0 ? null : undefined,
            isRead: false,
            sentAt: new Date(),
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                roles: {
                  select: {
                    role: true,
                  },
                },
              },
            },
            MessageAttachment: true,
          },
        });

        if (attachments.length > 0) {
          await tx.messageAttachment.createMany({
            data: attachments.map((att) => ({
              messageId: message.id,
              url: att.url,
              type: toPrismaFileType(att.type),
            })),
          });

          const messageWithAttachments = await tx.message.findUnique({
            where: { id: message.id },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  roles: {
                    select: {
                      role: true,
                    },
                  },
                },
              },
              MessageAttachment: true,
            },
          });

          return messageWithAttachments;
        }

        return message;
      }, {
        maxWait: 5000, // default: 2000
        timeout: 15000, // Reduced to comply with Prisma Accelerate limits
      });

      if (!result) throw new Error("Unable to save message in database");

      console.log(`[SELLER-BACKEND] ✅ Message persisted to database with ID: ${result.id}`);

      // Map for GraphQL response
      const graphqlResult = {
        ...result,
        attachments: result.MessageAttachment || [],
      };

      const realtimePayload: NewMessagePayload = {
        id: result.id,
        conversationId,
        content: result.content || "",
        type: result.type,
        clientId,
        fileUrl: result.fileUrl || null,
        isRead: result.isRead,
        sentAt: result.sentAt,
        sender: result.sender,
        attachments: (result.MessageAttachment || []).map((att) => ({
          id: att.id,
          url: att.url,
          type: att.type,
        })),
      };

      const channel = `conversation:${conversationId}`;

      // Side-effects function
      const runSideEffects = async () => {
        console.log(`[SELLER-BACKEND] 📤 Starting background side-effects for message: ${result.id}`);
        const tasks: Promise<any>[] = [];

        // 1. Emit to conversation channel (Most critical for real-time)
        tasks.push(
          pusher.trigger(channel, "message.newMessage", realtimePayload)
            .catch((err) => console.error("[SELLER-BACKEND] Realtime emit error:", err))
        );

        // 2. Emit to individual user channels
        const participantIds = new Set<string>();
        if (conversation.sender?.id) participantIds.add(conversation.sender.id);
        if (conversation.reciever?.id) participantIds.add(conversation.reciever.id);
        conversation.ConversationParticipant?.forEach((p) => {
          if (p.user?.id) participantIds.add(p.user.id);
        });

        for (const pid of participantIds) {
          if (!pid || pid === user.id) continue;
          tasks.push(
            pusher.trigger(`user:${pid}`, "message.newMessage", realtimePayload)
              .catch((err: any) => console.error(`[SELLER-BACKEND] User emit error (${pid}):`, err))
          );
        }

        // 3. Push Notification to receiver
        const receiverId = conversation.senderId === user.id ? conversation.recieverId : conversation.senderId;
        if (receiverId) {
          const senderName = `${result.sender?.firstName || ""} ${result.sender?.lastName || ""}`.trim() || "A user";
          tasks.push(
            createAndPushNotification({
              userId: receiverId,
              title: "New Message",
              body: `${senderName} sent you a message`,
              type: "NEW_MESSAGE",
            }).catch((err) => console.error("[SELLER-BACKEND] Notification error:", err))
          );
        }

        // 4. Update other participants' lastReadAt
        tasks.push(
          prisma.conversationParticipant.updateMany({
            where: { conversationId, userId: { not: user.id } },
            data: { lastReadAt: null },
          }).catch((err) => console.error("[SELLER-BACKEND] Participant update error:", err))
        );

        await Promise.allSettled(tasks);
        console.log(`[SELLER-BACKEND] ✨ Background side-effects completed for message: ${result.id}`);
      };

      // FIRE AND FORGET: Don't await the side-effects to resolve the GraphQL request immediately
      runSideEffects().catch(err => console.error("[SELLER-BACKEND] Fatal error in background side-effects:", err));

      const endTime = Date.now();
      console.log(`[SELLER-BACKEND] ⚡ sendMessage response sent in ${endTime - startTime}ms (Background tasks started)`);

      return { ...graphqlResult, clientId };
    },
  },
};
