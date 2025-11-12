import { requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const sellerOrderResolver = {
  Query: {
    getSellerOrders: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireSeller(ctx);
        const sellerId = user.id;
        const prisma = ctx.prisma;

        const now = new Date();
        const currentMonthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        const prevMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Fetch orders for seller
        const orders = await prisma.sellerOrder.findMany({
          where: { sellerId },
          select: {
            id: true,
          },
        });

        // Count orders for current month
        const currentOrderCount = await prisma.sellerOrder.count({
          where: {
            sellerId,
            createdAt: {
              gte: currentMonthStart,
              lt: now,
            },
          },
        });

        // Count orders for previous month
        const prevOrderCount = await prisma.sellerOrder.count({
          where: {
            sellerId,
            createdAt: {
              gte: prevMonthStart,
              lt: prevMonthEnd,
            },
          },
        });

        // Calculate percentage change
        let percentChange = 0;
        if (prevOrderCount > 0) {
          percentChange =
            ((currentOrderCount - prevOrderCount) / prevOrderCount) * 100;
        } else if (currentOrderCount > 0) {
          percentChange = 100;
        }

        // Return orders + percentage change
        return {
          orders: orders ? orders : [],
          currentOrderCount,
          previousOrderCount: prevOrderCount,
          percentChange: Number(percentChange.toFixed(2)),
        };
      } catch (error: any) {
        console.error("Error occurred while fetching orders -->", error);
        throw error;
      }
    },
    getActiveUsersForSeller: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireSeller(ctx);
        const sellerId = user.id;
        const prisma = ctx.prisma;

        const now = new Date();

        const currentMonthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        const prevMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Helper function to get unique active users in a date range
        const getActiveUsers = async (start: Date, end: Date) => {
          const orders = await prisma.sellerOrder.findMany({
            where: {
              sellerId,
              createdAt: {
                gte: start,
                lt: end,
              },
            },
            select: { buyerOrderId: true },
          });

          const buyerIds = new Set<string>();

          for (const order of orders) {
            const buyerOrder = await prisma.order.findUnique({
              where: { id: order.buyerOrderId },
              select: { buyerId: true },
            });
            if (buyerOrder) buyerIds.add(buyerOrder.buyerId);
          }

          return buyerIds.size;
        };

        const currentActiveUsers = await getActiveUsers(currentMonthStart, now);
        const prevActiveUsers = await getActiveUsers(
          prevMonthStart,
          prevMonthEnd
        );

        // Calculate percentage change
        let percentChange = 0;
        if (prevActiveUsers > 0) {
          percentChange =
            ((currentActiveUsers - prevActiveUsers) / prevActiveUsers) * 100;
        } else if (currentActiveUsers > 0) {
          percentChange = 100;
        }

        return {
          currentActiveUsers,
          previousActiveUsers: prevActiveUsers,
          percentChange: Number(percentChange.toFixed(2)),
        };
      } catch (error: any) {
        console.error("Error calculating active users change:", error);
        throw error;
      }
    },
  },

  Mutation: {},
};
