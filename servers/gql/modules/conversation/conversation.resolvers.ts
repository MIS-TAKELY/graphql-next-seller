import { requireBuyer } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const conversationResolvers = {
  Query: {
    conversationByProduct: async (
      _parent: any,
      { productId }: { productId: string },
      { prisma, user }: GraphQLContext
    ) => {
      // Fetch the active conversation for this product and buyer
      if (!user) throw new Error("User id not available");
      const conversation = await prisma.conversation.findFirst({
        where: {
          productId,
          senderId: user.id,
          isActive: true,
        },
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          reciever: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ConversationParticipant: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          messages: {
            orderBy: { sentAt: "asc" },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  roles: {
                    select: {
                      role: true,
                    },
                  },
                },
              },
              // attachments: true,
            },
          },
        },
      });

      if (!conversation) {
        return null; // Since the schema allows null for single Conversation
      }

      // Compute lastMessage and unreadCount
      const lastMessage =
        (conversation as any).messages[(conversation as any).messages.length - 1] || null;

      const participantRaw = (conversation as any).ConversationParticipant;
      const participant = participantRaw ? (participantRaw as any[]).find(
        (p: any) => p.userId === user.id
      ) : null;
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: user.id },
          isRead: false,
        },
      });

      return {
        ...conversation,
        lastMessage,
        unreadCount,
        messages: undefined, // Exclude full messages list
        ConversationParticipant: undefined,
      };
    },
    conversations: async (
      _parent: any,
      { recieverId }: { recieverId: string },
      { prisma, user }: GraphQLContext
    ) => {
      console.log("senderid---->", recieverId, user?.id);
      if (!user) {
        throw new Error("Unauthorized: User not authenticated");
      }

      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [{ recieverId: user.id }, { senderId: user.id }],
          isActive: true,
        },
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          reciever: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ConversationParticipant: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          messages: {
            orderBy: { sentAt: "desc" },
            take: 1, // Only latest for lastMessage
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  roles: {
                    select: {
                      role: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      // Compute extras for each conversation
      const conversationsWithExtras = await Promise.all(
        conversations.map(async (conv: any) => {
          const lastMessage = conv.messages[0] || null;

          const participantRaw = conv.ConversationParticipant;
          const participant = participantRaw ? (participantRaw as any[]).find(
            (p: any) => p.userId === user.id
          ) : null;
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: user.id },
              isRead: false,
            },
          });

          return {
            ...conv,
            lastMessage,
            unreadCount,
            messages: undefined, // Exclude
            ConversationParticipant: undefined,
          };
        })
      );

      return conversationsWithExtras; // Always returns array, never null
    },
  },
  Mutation: {
    markAsRead: async (
      _parent: any,
      { conversationId }: { conversationId: string },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) throw new Error("Unauthorized");

      await prisma.conversationParticipant.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId: user.id,
          },
        },
        update: {
          lastReadAt: new Date(),
        },
        create: {
          conversationId,
          userId: user.id,
          lastReadAt: new Date(),
        },
      });

      // Mark individual messages as read too
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: user.id },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return true;
    },
    createConversation: async (
      _parent: any,
      { input }: { input: { productId: string } },
      context: GraphQLContext
    ): Promise<any> => {
      const user = requireBuyer(context);

      const { prisma } = context;

      const { productId } = input;
      const senderId = user.id;

      // Fetch product and its seller
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, sellerId: true },
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      const recieverId = product.sellerId;
      if (senderId === recieverId) {
        throw new Error("Cannot start a conversation with yourself.");
      }

      // Check for existing conversation
      let conversation = await prisma.conversation.findUnique({
        where: {
          senderId_recieverId_productId: { senderId, recieverId, productId },
        },
        include: {
          ConversationParticipant: true,
        },
      });

      if (conversation) {
        // If exists and active, return it (reuse)
        if (!conversation.isActive) {
          throw new Error("Conversation is inactive.");
        }
        return conversation;
      }

      // Create new conversation (transaction for atomicity)
      const result = await prisma.$transaction(
        async (tx: any) => {
          // Create conversation
          const newConversation = await tx.conversation.create({
            data: {
              productId,
              senderId,
              recieverId,
              title: `Chat about ${product.name}`, // Auto-generate title
              isActive: true,
            },
            include: {
              product: { select: { id: true, name: true, slug: true } },
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              reciever: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              ConversationParticipant: true,
            },
          });

          // Add participants if not already (shouldn't be, since new)
          await tx.conversationParticipant.createMany({
            data: [
              { conversationId: newConversation.id, userId: senderId },
              { conversationId: newConversation.id, userId: recieverId },
            ],
            skipDuplicates: true, // Safe in case of retry
          });

          // Refetch with participants
          return tx.conversation.findUnique({
            where: { id: newConversation.id },
            include: {
              product: { select: { id: true, name: true, slug: true } },
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              reciever: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              ConversationParticipant: {
                include: {
                  user: {
                    select: { id: true, firstName: true, lastName: true },
                  },
                },
              },
            },
          });
        },
        {
          timeout: 15000,
        }
      );

      // Optional: Publish to Upstash for real-time notification to seller
      if (result) {
        try {
          // await publish({
          //   type: "CONVERSATION_CREATED",
          //   payload: {
          //     conversation: {
          //       ...result,
          //       createdAt: result.createdAt.toISOString(),
          //     },
          //   },
          //   room: `conversation:${result.id}`,
          // });


        } catch (error) {
          console.error("Failed to publish conversation creation:", error);
        }
      }

      return result;
    },
  },
};

// Merge: export const resolvers = { ...messageResolvers, ...conversationResolvers };
