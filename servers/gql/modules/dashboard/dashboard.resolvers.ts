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

interface GetTopProductsArgs {
  limit?: number;
  year?: number;
  month?: number; // 1-12
}

interface TopProduct {
  productId: string;
  productName: string;
  variantId: string | null;
  sku: string | null;
  image: string | null;
  totalQuantity: number;
  totalRevenue: number;
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
    getTopProducts: async (
      _: unknown,
      args: GetTopProductsArgs,
      ctx: GraphQLContext
    ): Promise<{ products: TopProduct[]; totalProducts: number }> => {
      const user = await requireSeller(ctx);
      const prisma = ctx.prisma;
      const sellerId = user.id;

      const { limit = 10, year, month } = args;

      // Build date filter (UTC to avoid timezone bugs)
      const dateWhere: { gte?: Date; lt?: Date } = {};

      if (year) {
        if (month) {
          dateWhere.gte = new Date(Date.UTC(year, month - 1, 1)); // First day of month
          dateWhere.lt = new Date(Date.UTC(year, month, 1)); // First day of next month
        } else {
          dateWhere.gte = new Date(Date.UTC(year, 0, 1));
          dateWhere.lt = new Date(Date.UTC(year + 1, 0, 1));
        }
      }

      // Step 1: Aggregate from SellerOrderItem → SellerOrder → ProductVariant → Product
      const orderItems = await prisma.sellerOrderItem.findMany({
        where: {
          sellerOrder: {
            sellerId,
            status: "DELIVERED",
            ...(Object.keys(dateWhere).length > 0 && {
              createdAt: dateWhere,
            }),
          },
        },
        select: {
          quantity: true,
          totalPrice: true,
          variant: {
            select: {
              id: true,
              sku: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    where: { mediaType: "PRIMARY", sortOrder: 0 },
                    select: { url: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: [
          // We’ll sort in memory after grouping (Prisma doesn’t support GROUP BY + ORDER BY in same query easily)
          { totalPrice: "desc" },
        ],
      });

      // Step 2: Group by product + variant in JS (fast enough for dashboard)
      const grouped = new Map<
        string,
        {
          productId: string;
          productName: string;
          variantId: string | null;
          sku: string | null;
          image: string | null;
          totalQuantity: number;
          totalRevenue: number;
        }
      >();

      for (const item of orderItems as any[]) {
        const variant = item.variant;
        const product = variant.product;
        const key = `${product.id}_${variant.id || "novariant"}`;

        const existing = grouped.get(key);
        const imageUrl = product.images[0]?.url ?? null;

        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += Number(item.totalPrice);
        } else {
          grouped.set(key, {
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            sku: variant.sku,
            image: imageUrl,
            totalQuantity: item.quantity,
            totalRevenue: Number(item.totalPrice),
          });
        }
      }

      // Step 3: Sort by revenue and apply limit
      const sortedProducts = Array.from(grouped.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);

      // Optional: Round to 2 decimals
      const products = sortedProducts.map((p) => ({
        ...p,
        totalRevenue: Number(p.totalRevenue.toFixed(2)),
      }));

      return {
        products,
        totalProducts: products.length,
      };
    },
  },
};
