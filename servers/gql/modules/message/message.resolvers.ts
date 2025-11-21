// servers/gql/messageResolvers.ts
import type { FileType as PrismaFileType } from "@/app/generated/prisma";
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
          sender: { select: { id: true, clerkId: true } },
          reciever: { select: { id: true, clerkId: true } },
          ConversationParticipant: {
            select: {
              user: { select: { id: true, clerkId: true } },
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
      });

      if (!result) throw new Error("Unable to save message in database");

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
      try {
        await realtime
          .channel(channel)
          .emit("message.newMessage", realtimePayload);
      } catch (error) {
        console.error("Failed to publish to Upstash Realtime:", error);
      }

      const participantClerkIds = new Set<string>();
      if (conversation.sender?.clerkId) {
        participantClerkIds.add(conversation.sender.clerkId);
      }
      if (conversation.reciever?.clerkId) {
        participantClerkIds.add(conversation.reciever.clerkId);
      }
      conversation.ConversationParticipant?.forEach((participant) => {
        const clerkId = participant.user?.clerkId;
        if (clerkId) participantClerkIds.add(clerkId);
      });

      for (const clerkId of participantClerkIds) {
        if (!clerkId || clerkId === user.clerkId) continue;
        try {
          await realtime
            .channel(`user:${clerkId}`)
            .emit("message.newMessage", realtimePayload);
        } catch (error) {
          console.error(
            "Failed to publish user-level message notification:",
            error
          );
        }
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
