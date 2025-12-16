import { requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const customerResolvers = {
  Query: {
    getCustomers: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      try {
        const user = requireSeller(ctx);
        const prisma = ctx.prisma;
        const sellerId = user.id;

        if (!sellerId) throw new Error("Seller ID not found");

        // Get all unique buyers who have ordered from this seller
        const sellerOrders = await prisma.sellerOrder.findMany({
          where: {
            sellerId,
            status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
          },
          include: {
            order: {
              include: {
                buyer: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // Aggregate customer data
        const customerMap: Record<
          string,
          {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            createdAt: Date;
            orders: number;
            totalSpent: number;
            lastOrderDate: Date | null;
          }
        > = {};

        for (const sellerOrder of sellerOrders) {
          const buyer = sellerOrder.order.buyer;
          if (!buyer) continue;

          if (!customerMap[buyer.id]) {
            customerMap[buyer.id] = {
              id: buyer.id,
              email: buyer.email,
              firstName: buyer.firstName,
              lastName: buyer.lastName,
              phone: buyer.phone,
              createdAt: buyer.createdAt,
              orders: 0,
              totalSpent: 0,
              lastOrderDate: null,
            };
          }

          customerMap[buyer.id].orders += 1;
          customerMap[buyer.id].totalSpent += Number(sellerOrder.total);
          if (
            !customerMap[buyer.id].lastOrderDate ||
            sellerOrder.createdAt > customerMap[buyer.id].lastOrderDate!
          ) {
            customerMap[buyer.id].lastOrderDate = sellerOrder.createdAt;
          }
        }

        // Get average ratings for each customer
        const customerIds = Object.keys(customerMap);
        const reviews = await prisma.review.findMany({
          where: {
            product: { sellerId },
            status: "APPROVED",
          },
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        });

        const customerRatings: Record<string, number[]> = {};
        for (const review of reviews) {
          if (customerIds.includes(review.userId)) {
            if (!customerRatings[review.userId]) {
              customerRatings[review.userId] = [];
            }
            customerRatings[review.userId].push(review.rating);
          }
        }

        // Calculate stats
        const customers = Object.values(customerMap).map((customer) => {
          const ratings = customerRatings[customer.id] || [];
          const avgRating =
            ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
              : 0;

          return {
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            totalOrders: customer.orders,
            totalSpent: customer.totalSpent,
            averageOrderValue:
              customer.orders > 0 ? customer.totalSpent / customer.orders : 0,
            lastOrderDate: customer.lastOrderDate,
            createdAt: customer.createdAt,
            rating: avgRating,
          };
        });

        // Calculate overall stats
        const totalRevenue = customers.reduce(
          (sum, c) => sum + c.totalSpent,
          0
        );
        const allRatings = Object.values(customerRatings).flat();
        const averageRating =
          allRatings.length > 0
            ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
            : 0;

        // Active customers (ordered in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeCustomers = customers.filter(
          (c) => c.lastOrderDate && c.lastOrderDate >= thirtyDaysAgo
        ).length;

        return {
          customers: customers.sort((a, b) => {
            // Sort by last order date (most recent first)
            if (!a.lastOrderDate && !b.lastOrderDate) return 0;
            if (!a.lastOrderDate) return 1;
            if (!b.lastOrderDate) return -1;
            return b.lastOrderDate.getTime() - a.lastOrderDate.getTime();
          }),
          stats: {
            totalCustomers: customers.length,
            totalRevenue,
            averageRating,
            activeCustomers,
          },
        };
      } catch (error: any) {
        console.log("error while fetching customer-->", error);
        console.error(error);
      }
    },
  },
};
