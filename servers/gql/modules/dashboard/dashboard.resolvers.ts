import { requireSeller } from "../../auth/auth";
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
    // ✅ getTotalRevenue — type safe
    getTotalRevenue: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext
    ): Promise<RevenueResponse> => {
      const user = requireSeller(ctx);
      const prisma = ctx.prisma;
      const sellerId = user.id;

      if (!sellerId) throw new Error("Seller ID not found");

      console.log("Seller id -->", sellerId);

      const seller = await prisma.user.findUnique({
        where: { id: sellerId },
        select: { id: true, role: true },
      });

      if (!seller) throw new Error("Seller not found");
      if (seller.role !== "SELLER") throw new Error("User is not a seller");

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // ✅ Use Prisma’s aggregate type inference
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
        percentChange = 100;
      }

      return {
        currentRevenue: Number(currentTotal),
        previousRevenue: Number(prevTotal),
        percentChange: Number(percentChange.toFixed(2)),
      };
    },

    // ✅ getMonthlySales — type safe
    getMonthlySales: async (
      _: unknown,
      args: GetMonthlySalesArgs,
      ctx: GraphQLContext
    ): Promise<MonthlySales[]> => {
      const user = requireSeller(ctx);
      const prisma = ctx.prisma;
      const sellerId = user.id;

      if (!sellerId) throw new Error("Seller ID not found");

      const { year } = args;
      if (!year || year < 1900 || year > 3000) {
        throw new Error(
          "Invalid year. Please provide a 4-digit year (e.g., 2024)."
        );
      }

      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

      // ✅ Explicit type inference from Prisma
      const orders = await prisma.sellerOrder.findMany({
        where: {
          sellerId, // make sure your schema supports this field
          createdAt: { gte: startOfYear, lt: endOfYear },
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
        select: { total: true, createdAt: true },
      });

      const monthlyTotals: MonthlySales[] = Array.from(
        { length: 12 },
        (_, i) => ({
          name: new Date(0, i).toLocaleString("en", { month: "short" }),
          total: 0,
        })
      );

      for (const order of orders) {
        const monthIndex = order.createdAt.getMonth();
        monthlyTotals[monthIndex].total += Number(order.total);
      }

      return monthlyTotals;
    },
  },
};
