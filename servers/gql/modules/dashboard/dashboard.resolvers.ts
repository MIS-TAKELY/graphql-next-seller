import { prisma } from "@/lib/db/prisma";
import { requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const dashboardResolvers = {
  Query: {
    getTotalRevenue: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireSeller(ctx);
        const sellerId = user.id;

        const seller = await prisma.user.findUnique({
          where: { id: sellerId },
          select: { id: true, role: true },
        });

        if (!seller) throw new Error("Seller not found");
        if (seller.role !== "SELLER") throw new Error("User is not a seller");

        // Get current date
        const now = new Date();

        // First day of current month
        const currentMonthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        // First day of previous month
        const prevMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        // Last day of previous month
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Revenue for current month
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

        // Revenue for previous month
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

        const currentTotal = currentRevenue._sum.total ?? 0;
        const prevTotal = prevRevenue._sum.total ?? 0;

        // Calculate percentage change
        let percentChange = 0;
        if (prevTotal > 0) {
          percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
        } else if (currentTotal > 0) {
          // If no revenue last month but some revenue this month
          percentChange = 100;
        }

        return {
          currentRevenue: Number(currentTotal),
          previousRevenue: Number(prevTotal),
          percentChange: Number(percentChange.toFixed(2)),
        };
      } catch (error) {
        console.error("Error calculating revenue change:", error);
        throw error;
      } finally {
        await prisma.$disconnect();
      }
    },
   getMonthlySales: async (_: any, args: { year: number }) => {
  const { year } = args;

  // Ensure valid 4-digit year
  if (!year || year < 1900 || year > 3000) {
    throw new Error("Invalid year. Please provide a 4-digit year (e.g., 2024).");
  }

  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfYear, lt: endOfYear },
      status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
    },
    select: { total: true, createdAt: true },
  });

  const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(0, i).toLocaleString("en", { month: "short" }),
    total: 0,
  }));

  for (const order of orders) {
    const monthIndex = order.createdAt.getMonth();
    monthlyTotals[monthIndex].total += Number(order.total);
  }

  return monthlyTotals;
},

  },
  Mutation: {},
};
