// servers/gql/messageResolvers.ts

import { realtime } from "@/lib/realtime";
import { GraphQLContext } from "../../context";

export const messageResolvers = {
  Query: {
    messages: async (
      _parent: any,
      {
        conversationId,
        limit = 20,
        offset = 0,
      }: { conversationId: string; limit?: number; offset?: number },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) {
        throw new Error("Unauthorized: User must be logged in.");
      }

      // Verify user participation in the conversation
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
        throw new Error(
          "Unauthorized: You are not a participant in this conversation."
        );
      }

      // Fetch messages with attachments and sender info
      const messages = await prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          MessageAttachment: true,
        },
        orderBy: { sentAt: "asc" }, // old to new
        skip: offset,
        take: limit,
      });

      return messages;
    },
  },
  Mutation: {
    sendMessage: async (
      _parent: any,
      {
        input,
      }: {
        input: {
          conversationId: string;
          content?: string;
          type?: string;
          clientId?: string | undefined;
          attachments?: Array<{ url: string; type: string }>;
        };
      },
      { prisma, user }: GraphQLContext // Removed 'publish' since we'll use direct realtime emit
    ): Promise<any> => {
      if (!user) {
        throw new Error(
          "Unauthorized: User must be logged in to send a message."
        );
      }

      const {
        conversationId,
        content,
        clientId,
        type,
        attachments = [],
      } = input;

      const prismaType =
        (type?.toUpperCase() as
          | "TEXT"
          | "IMAGE"
          | "VIDEO"
          | "SYSTEM"
          | undefined) ?? "TEXT";

      // Validate conversation and user's participation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          sender: { select: { id: true } },
          reciever: { select: { id: true } },
          ConversationParticipant: true,
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found.");
      }

      const isParticipant =
        conversation.senderId === user.id ||
        conversation.recieverId === user.id;
      if (!isParticipant) {
        throw new Error(
          "Unauthorized: You are not a participant in this conversation."
        );
      }

      // Transaction to create message and attachments atomically
      const result = await prisma.$transaction(async (tx) => {
        const message = await tx.message.create({
          data: {
            conversationId,
            senderId: user.id,
            content: content || null,
            type: prismaType,
            clientId,
            fileUrl: attachments.length > 0 ? null : undefined,
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
            MessageAttachment: true, // <-- Correct relation name
          },
        });

        // If you create attachments
        if (attachments.length > 0) {
          await tx.messageAttachment.createMany({
            data: attachments.map((att) => ({
              messageId: message.id,
              url: att.url,
              type: att.type.toUpperCase() as "IMAGE" | "VIDEO",
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
                  role: true,
                },
              },
              MessageAttachment: true, // <-- again, exact relation name
            },
          });

          return messageWithAttachments;
        }

        return message;
      });
      if (!result) throw new Error("Unable to save message in database");
      const channel = `conversation:${conversationId}`;
      console.log("channel--------------->", channel);
      console.log("result-->", result);
      try {
        // Emit using the nested event path: realtime.message.newMessage.emit(payload)
        // Payload matches the schema for message.newMessage (direct message object)
        await realtime.channel(channel).message.newMessage.emit({
          id: result.id,
          content: result.content || "",
          type: result.type,
          clientId,
          fileUrl: result.fileUrl || "",
          isRead: result.isRead || false,
          sentAt: result.sentAt.toISOString(),
          sender: result.sender,
          attachments:
            result.MessageAttachment?.map((att: any) => ({
              id: att.id,
              url: att.url,
              type: att.type as "IMAGE" | "VIDEO",
            })) || [],
        });
      } catch (error) {
        console.error("Failed to publish message to Upstash Realtime:", error);
        // Don't throw; DB write succeeded, real-time is best-effort
      }

      // Mark as unread for the other participant (adjust logic if needed for your unreadCount)
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: { not: user.id }, // Update the other participant's lastReadAt if needed
        },
        data: { lastReadAt: null }, // Reset to force unread status; adjust logic as needed
      });

      return { ...result, clientId };
    },
  },
};

// Merge into your main resolvers
// e.g., const resolvers = { ...yourExistingResolvers, ...messageResolvers };
