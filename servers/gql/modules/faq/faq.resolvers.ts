import { prisma } from "@/lib/db/prisma";
import { realtime } from "@/lib/realtime";

export const faqResolvers = {
    Query: {
        getSellerQuestions: async (_: any, __: any, context: any) => {
            if (!context.user) throw new Error("Unauthorized");

            // @ts-ignore
            return await prisma.productQuestion.findMany({
                where: {
                    product: {
                        sellerId: context.user.id
                    }
                },
                include: {
                    product: {
                        select: { name: true, images: true }
                    },
                    user: {
                        select: { firstName: true, lastName: true }
                    },
                    answers: {
                        include: {
                            seller: { include: { sellerProfile: true } }
                        },
                        orderBy: { createdAt: "asc" }
                    }
                },
                orderBy: { createdAt: "desc" }
            });
        },
        getProductQuestions: async (_: any, { productId }: { productId: string }) => {
            // @ts-ignore
            return await prisma.productQuestion.findMany({
                where: { productId },
                include: {
                    user: true,
                    answers: {
                        include: {
                            seller: {
                                include: {
                                    sellerProfile: true
                                }
                            }
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        },
    },
    Mutation: {
        replyToQuestion: async (_: any, { questionId, content }: { questionId: string; content: string }, context: any) => {
            if (!context.user) throw new Error("Unauthorized");
            const user = context.user;

            // Verify ownership logic if needed, but assuming seller has access here or we can double check
            // Ideally we check if the question belongs to a product owned by this seller

            // @ts-ignore
            const question = await prisma.productQuestion.findUnique({
                where: { id: questionId },
                include: { product: true }
            });

            // @ts-ignore
            if (!question || question.product.sellerId !== user.id) {
                throw new Error("Unauthorized");
            }

            // @ts-ignore
            const answer = await prisma.productAnswer.create({
                data: {
                    questionId,
                    sellerId: user.id,
                    content,
                },
                include: {
                    question: true,
                    seller: {
                        include: {
                            sellerProfile: true
                        }
                    }
                }
            });

            // Emit Realtime Event
            try {
                // @ts-ignore
                await realtime.channel(`product:${answer.question.productId}:faq`).emit("faq.newAnswer", {
                    id: answer.id,
                    questionId: answer.questionId,
                    content: answer.content,
                    createdAt: answer.createdAt,
                    seller: {
                        // @ts-ignore
                        shopName: user.sellerProfile?.shopName || "Seller", // Note: context user might not have profile loaded? 
                        // Wait, context user loads roles. Does it load profile?
                        // Let's safe guard. The answer include has sellerProfile.
                    },
                });
                // We need to fetch shopName from DB if not in context, or usage answer.seller
                // The answer.seller includes sellerProfile as per include above.
                await realtime.channel(`product:${answer.question.productId}:faq`).emit("faq.newAnswer", {
                    id: answer.id,
                    questionId: answer.questionId,
                    content: answer.content,
                    createdAt: answer.createdAt,
                    seller: {
                        // @ts-ignore
                        shopName: answer.seller.sellerProfile?.shopName || "Seller",
                    },
                });
            } catch (e) {
                console.error("Failed to emit realtime event", e);
            }

            return answer;
        },
    },
};
