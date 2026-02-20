import { requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

interface CustomerFilterInput {
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const customerResolvers = {
  Query: {
    getCustomers: async (
      _: unknown,
      { skip, take, filter }: { skip?: number; take?: number; filter?: CustomerFilterInput },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireSeller(ctx);
        const prisma = ctx.prisma;
        const sellerId = user.id;

        if (!sellerId) throw new Error("Seller ID not found");

        const pageSize = take ?? 20;
        const pageSkip = skip ?? 0;

        // Use raw SQL for efficient aggregation - much faster than N+1 queries
        const customerAggregation = await prisma.$queryRaw`
          SELECT 
            u.id as "userId",
            u.email,
            u."firstName",
            u."lastName",
            u."phoneNumber",
            u."createdAt",
            COUNT(DISTINCT so.id) as "orderCount",
            COALESCE(SUM(so.total), 0)::numeric as "totalSpent",
            MAX(so."createdAt") as "lastOrderDate"
          FROM "seller_orders" so
          JOIN "orders" o ON so."buyerOrderId" = o.id
          JOIN "user" u ON o."buyerId" = u.id
          WHERE so."sellerId" = ${sellerId}
            AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
            ${filter?.dateFrom ? prisma.$queryRaw`AND so."createdAt" >= ${filter.dateFrom}` : prisma.$queryRaw``}
            ${filter?.dateTo ? prisma.$queryRaw`AND so."createdAt" <= ${filter.dateTo}` : prisma.$queryRaw``}
          GROUP BY u.id, u.email, u."firstName", u."lastName", u."phoneNumber", u."createdAt"
          ORDER BY "lastOrderDate" DESC
          LIMIT ${pageSize} OFFSET ${pageSkip}
        ` as Array<{
          userId: string;
          email: string;
          firstName: string | null;
          lastName: string | null;
          phoneNumber: string | null;
          createdAt: Date;
          orderCount: number;
          totalSpent: number;
          lastOrderDate: Date | null;
        }>;

        // Get total count for pagination
        const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(DISTINCT u.id) as count
          FROM "seller_orders" so
          JOIN "orders" o ON so."buyerOrderId" = o.id
          JOIN "user" u ON o."buyerId" = u.id
          WHERE so."sellerId" = ${sellerId}
            AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
        `;
        const totalCount = Number(countResult[0]?.count ?? 0);

        // Get reviews stats using SQL aggregation
        const customerIds = customerAggregation.map(c => c.userId);
        
        let reviewStats: Array<{ userId: string; avgRating: number; reviewCount: bigint }> = [];
        
        if (customerIds.length > 0) {
          // Use parameterized query with array
          reviewStats = await prisma.$queryRaw<Array<{ userId: string; avgRating: number; reviewCount: bigint }>>`
            SELECT 
              r."userId",
              AVG(r.rating)::numeric(3,2) as "avgRating",
              COUNT(*)::int as "reviewCount"
            FROM review r
            JOIN product p ON r."productId" = p.id
            WHERE p."sellerId" = ${sellerId}
              AND r.status = 'APPROVED'
              AND r."userId" = ANY(${customerIds}::text[])
            GROUP BY r."userId"
          `;
        }

        // Create lookup map for reviews
        const reviewMap = new Map<string, { avgRating: number; reviewCount: number }>();
        for (const r of reviewStats) {
          reviewMap.set(r.userId, { avgRating: Number(r.avgRating), reviewCount: Number(r.reviewCount) });
        }

        // Transform to customer objects
        const customers = customerAggregation.map((customer) => {
          const reviewStats = reviewMap.get(customer.userId);
          return {
            id: customer.userId,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phoneNumber,
            totalOrders: Number(customer.orderCount),
            totalSpent: Number(customer.totalSpent),
            averageOrderValue: customer.orderCount > 0 
              ? Number(customer.totalSpent) / Number(customer.orderCount) 
              : 0,
            lastOrderDate: customer.lastOrderDate,
            createdAt: customer.createdAt,
            rating: reviewStats?.avgRating ?? 0,
          };
        });

        // Calculate overall stats (cached or computed once)
        const statsAggregation = await prisma.$queryRaw<Array<{
          totalCustomers: bigint;
          totalRevenue: number;
          avgRating: number;
          activeCustomers: bigint;
        }>>`
          SELECT 
            COUNT(DISTINCT u.id) as "totalCustomers",
            COALESCE(SUM(so.total), 0)::numeric as "totalRevenue",
            (SELECT AVG(r.rating)::numeric(3,2) FROM review r 
             JOIN product p ON r."productId" = p.id 
             WHERE p."sellerId" = ${sellerId} AND r.status = 'APPROVED') as "avgRating",
            COUNT(DISTINCT CASE WHEN so."createdAt" >= NOW() - INTERVAL '30 days' THEN u.id END) as "activeCustomers"
          FROM "seller_orders" so
          JOIN "orders" o ON so."buyerOrderId" = o.id
          JOIN "user" u ON o."buyerId" = u.id
          WHERE so."sellerId" = ${sellerId}
            AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
        `;

        const stats = statsAggregation[0] ?? { totalCustomers: 0n, totalRevenue: 0, avgRating: 0, activeCustomers: 0 };

        return {
          customers,
          totalCount,
          stats: {
            totalCustomers: Number(stats.totalCustomers),
            totalRevenue: Number(stats.totalRevenue),
            averageRating: Number(stats.avgRating) || 0,
            activeCustomers: Number(stats.activeCustomers),
          },
        };
      } catch (error: any) {
        console.error("error while fetching customer-->", error);
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }
    },
  },
};
