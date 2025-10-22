// servers/gql/messageResolvers.ts
import { realtime } from "@/lib/realtime";
import { GraphQLContext } from "../../context";

export const messageResolvers = {
  Query: {
    messages: async (
      _parent: any,
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
        conversation.senderId === user.id || conversation.recieverId === user.id;

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
              role: true,
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
      _parent: any,
      {
        input,
      }: {
        input: {
          conversationId: string;
          content?: string;
          type: string;
          clientId?: string;
          attachments?: Array<{ url: string; type: string }>;
        };
      },
      { prisma, user }: GraphQLContext
    ): Promise<any> => {
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

      const prismaType =
        (type?.toUpperCase() as
          | "TEXT"
          | "IMAGE"
          | "VIDEO"
          | "SYSTEM") ?? "TEXT";

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
        conversation.senderId === user.id || conversation.recieverId === user.id;
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
                role: true,
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

      const channel = `conversation:${conversationId}`;
      try {
        await realtime.channel(channel).message.newMessage.emit({
          id: result.id,
          conversationId,
          content: result.content || "",
          type: result.type,
          clientId,
          fileUrl: result.fileUrl || null,
          isRead: result.isRead,
          sentAt: result.sentAt.toISOString(),
          sender: result.sender,
          attachments: (result.MessageAttachment || []).map((att) => ({
            id: att.id,
            url: att.url,
            type: att.type as "IMAGE" | "VIDEO",
          })),
        });
      } catch (error) {
        console.error("Failed to publish to Upstash Realtime:", error);
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