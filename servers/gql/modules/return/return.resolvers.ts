
import { prisma } from "../../../../lib/db/prisma";
import { requireAuth, requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const returnResolvers = {
    Query: {
        sellerReturns: async (
            _: any,
            { limit, offset, status }: { limit: number; offset: number; status?: any },
            ctx: GraphQLContext
        ) => {
            const seller = requireSeller(ctx);

            return prisma.return.findMany({
                where: {
                    items: {
                        some: {
                            orderItem: {
                                variant: {
                                    product: {
                                        sellerId: seller.id
                                    }
                                }
                            }
                        }
                    },
                    ...(status ? { status } : {})
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
                include: {
                    items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } },
                    order: true,
                    user: true,
                },
            });
        },
        getReturn: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
            const user = requireAuth(ctx); // Seller or Admin
            const returnRequest = await prisma.return.findUnique({
                where: { id },
                include: {
                    items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } },
                    order: true,
                    user: true,
                },
            });

            if (!returnRequest) return null;

            // Access Control: Seller must own at least one item in the return
            const isSeller = returnRequest.items.some(i => i.orderItem.variant.product.sellerId === user.id);

            if (!isSeller && !user.roles.includes("ADMIN")) {
                throw new Error("Unauthorized");
            }

            return returnRequest;
        }
    },
    Mutation: {
        updateReturnStatus: async (
            _: any,
            { input }: { input: any },
            ctx: GraphQLContext
        ) => {
            const user = requireSeller(ctx);
            const { returnId, status, rejectionReason } = input;

            const returnRequest = await prisma.return.findUnique({
                where: { id: returnId },
                include: { items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } } }
            });

            if (!returnRequest) throw new Error("Return request not found");

            // Access Control
            const isSeller = returnRequest.items.some(i => i.orderItem.variant.product.sellerId === user.id);
            if (!isSeller && !user.roles.includes("ADMIN")) throw new Error("Unauthorized");

            const updateData: any = { status };
            if (rejectionReason) updateData.rejectionReason = rejectionReason;

            // Status side-effects
            if (status === "APPROVED") {
                updateData.pickupScheduledAt = new Date();
            } else if (status === "RECEIVED") {
                updateData.receivedAt = new Date();
            } else if (status === "INSPECTED") {
                updateData.inspectedAt = new Date();
            } else if (status === "ACCEPTED") {
                updateData.refundStatus = "INITIATED";
            }

            return prisma.return.update({
                where: { id: returnId },
                data: updateData,
                include: {
                    items: { include: { orderItem: true } },
                    order: true
                }
            });
        }
    }
};
