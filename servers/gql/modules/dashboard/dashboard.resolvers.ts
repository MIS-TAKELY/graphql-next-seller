// resolvers/dashboardResolvers.ts
import { requireSeller } from "../../auth/auth"; // ← Now async & correct
import { GraphQLContext } from "../../context";

interface GetMonthlySalesArgs {
  year: number;
}

interface RevenueResponse {
  currentRevenue: number;
  previousRevenue: number;
  percentChange: number;
}

interface MonthlySales {
  name: string;
  total: number;
}

export const dashboardResolvers = {
  Query: {
    // Total Revenue (Current vs Previous Month)
    getTotalRevenue: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext
    ): Promise<RevenueResponse> => {
      // This now checks UserRole table under the hood
      const user = await requireSeller(ctx);
      const prisma = ctx.prisma;
      const sellerId = user.id;

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of prev month

      // Current month revenue
      const currentRevenue = await prisma.sellerOrder.aggregate({
        where: {
          sellerId,
          status: "DELIVERED",
          createdAt: {
            gte: currentMonthStart,
            lt: now,
          },
        },
        _sum: { total: true },
      });

      // Previous month revenue
      const prevRevenue = await prisma.sellerOrder.aggregate({
        where: {
          sellerId,
          status: "DELIVERED",
          createdAt: {
            gte: prevMonthStart,
            lt: prevMonthEnd,
          },
        },
        _sum: { total: true },
      });

      const currentTotal = Number(currentRevenue._sum.total ?? 0);
      const prevTotal = Number(prevRevenue._sum.total ?? 0);

      let percentChange = 0;
      if (prevTotal > 0) {
        percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
      } else if (currentTotal > 0) {
        percentChange = 100; // From 0 to something = 100% growth
      }

      return {
        currentRevenue: Number(currentTotal.toFixed(2)),
        previousRevenue: Number(prevTotal.toFixed(2)),
        percentChange: Number(percentChange.toFixed(2)),
      };
    },

    // Monthly Sales Chart Data
    getMonthlySales: async (
      _: unknown,
      args: GetMonthlySalesArgs,
      ctx: GraphQLContext
    ): Promise<MonthlySales[]> => {
      const user = await requireSeller(ctx); // ← Now async!
      const prisma = ctx.prisma;
      const sellerId = user.id;

      const { year } = args;
      if (!year || year < 1900 || year > 3000) {
        throw new Error("Invalid year. Please provide a valid 4-digit year.");
      }

      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

      const orders = await prisma.sellerOrder.findMany({
        where: {
          sellerId,
          createdAt: { gte: startOfYear, lt: endOfYear },
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
        select: { total: true, createdAt: true },
      });

      // Initialize 12 months
      const monthlyTotals: MonthlySales[] = Array.from(
        { length: 12 },
        (_, i) => ({
          name: new Date(0, i).toLocaleString("en", { month: "short" }),
          total: 0,
        })
      );

      for (const order of orders) {
        const monthIndex = order.createdAt.getUTCMonth(); // Use UTC to avoid timezone bugs
        monthlyTotals[monthIndex].total += Number(order.total ?? 0);
      }

      // Round to 2 decimals
      return monthlyTotals.map((m) => ({
        ...m,
        total: Number(m.total.toFixed(2)),
      }));
    },
  },
};
