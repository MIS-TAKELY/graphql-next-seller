// servers/gql/messageResolvers.ts
import type { FileType as PrismaFileType } from "@/app/generated/prisma";
import { createAndPushNotification } from "@/lib/notification";
import { NewMessagePayload, realtime } from "@/lib/realtime";
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
        orderBy: { sentAt: "asc" },
        skip: offset,
        take: limit,
      });

      // Map to match GraphQL schema field names
      return messages.map((msg) => ({
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

      const {
        conversationId,
        content,
        clientId,
        type,
        attachments = [],
      } = input;

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
        timeout: 20000, // default: 5000
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
        sentAt: result.sentAt, // <-- keep as Date
        sender: result.sender,
        attachments: (result.MessageAttachment || []).map((att) => ({
          id: att.id,
          url: att.url,
          type: att.type,
        })),
      };

      const channel = `conversation:${conversationId}`;

      console.log("chennals-->", channel)

      realtime
        .channel(channel)
        .emit("message.newMessage", realtimePayload)
        .catch((error) => {
          console.error("Failed to publish to Upstash Realtime:", error);
        });

      const participantIds = new Set<string>();
      if (conversation.sender?.id) {
        participantIds.add(conversation.sender.id);
      }
      if (conversation.reciever?.id) {
        participantIds.add(conversation.reciever.id);
      }
      conversation.ConversationParticipant?.forEach((participant) => {
        const userId = participant.user?.id;
        if (userId) participantIds.add(userId);
      });

      for (const userId of participantIds) {
        if (!userId || userId === user.id) continue;
        realtime
          .channel(`user:${userId}`)
          .emit("message.newMessage", realtimePayload)
          .catch((error) => {
            console.error(
              "Failed to publish user-level message notification:",
              error
            );
          });
      }

      // Send push notification to receiver
      const receiverId =
        conversation.senderId === user.id
          ? conversation.recieverId
          : conversation.senderId;

      if (receiverId) {
        const senderName =
          `${result.sender?.firstName || ""} ${result.sender?.lastName || ""
            }`.trim() || "A seller";

        createAndPushNotification({
          userId: receiverId,
          title: "New Message",
          body: `${senderName} sent you a message`,
          type: "NEW_MESSAGE",
        }).catch((error) => {
          console.error("Failed to send push notification:", error);
        });
      }

      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: { not: user.id },
        },
        data: { lastReadAt: null },
      });

      return { ...graphqlResult, clientId };
    },
  },
};
