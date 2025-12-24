import { requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

enum TimePeriod {
  DAYS_7 = "DAYS_7",
  DAYS_30 = "DAYS_30",
  DAYS_90 = "DAYS_90",
  YEAR_1 = "YEAR_1",
}

interface DateRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

// Helper function to calculate date ranges based on period
function getDateRange(period: string): DateRange {
  const now = new Date();
  let start: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (period) {
    case TimePeriod.DAYS_7:
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousEnd = start;
      break;
    case TimePeriod.DAYS_30:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousEnd = start;
      break;
    case TimePeriod.DAYS_90:
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      previousStart = new Date(start.getTime() - 90 * 24 * 60 * 60 * 1000);
      previousEnd = start;
      break;
    case TimePeriod.YEAR_1:
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      previousStart = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      previousEnd = start;
      break;
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousEnd = start;
  }

  return {
    start,
    end: now,
    previousStart,
    previousEnd,
  };
}

// Helper to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Helper to calculate percentage change
function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous) * 100);
}

// Helper to get sales data points grouped by time period
async function getSalesDataPoints(
  prisma: any,
  sellerId: string,
  period: string,
  dateRange: DateRange
): Promise<any[]> {
  const { start, end } = dateRange;
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  let groupBy: "day" | "week" | "month" = "day";
  if (daysDiff > 90) groupBy = "month";
  else if (daysDiff > 30) groupBy = "week";

  const orders = await prisma.sellerOrder.findMany({
    where: {
      sellerId,
      status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
      createdAt: { gte: start, lte: end },
    },
    select: {
      total: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });

  // Group orders by time period
  const grouped: Record<string, { revenue: number; orders: number; sales: number }> = {};

  for (const order of orders) {
    const date = new Date(order.createdAt);
    let key: string;

    if (groupBy === "month") {
      key = date.toLocaleString("en", { month: "short", year: "numeric" });
    } else if (groupBy === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toLocaleDateString("en", { month: "short", day: "numeric" });
    } else {
      key = date.toLocaleDateString("en", { month: "short", day: "numeric" });
    }

    if (!grouped[key]) {
      grouped[key] = { revenue: 0, orders: 0, sales: 0 };
    }

    grouped[key].revenue += Number(order.total);
    grouped[key].orders += 1;
    grouped[key].sales += order.items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity),
      0
    );
  }

  return Object.entries(grouped)
    .map(([name, data]) => ({
      name,
      sales: data.sales,
      revenue: data.revenue,
      orders: data.orders,
    }))
    .sort((a, b) => {
      // Sort by date
      return new Date(a.name).getTime() - new Date(b.name).getTime();
    });
}

// Helper to get top products data
async function getTopProductsData(
  prisma: any,
  sellerId: string,
  dateRange: DateRange
): Promise<any[]> {
  const { start, end } = dateRange;

  const orderItems = await prisma.sellerOrderItem.findMany({
    where: {
      sellerOrder: {
        sellerId,
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start, lte: end },
      },
    },
    select: {
      totalPrice: true,
      quantity: true,
      variant: {
        select: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const productMap: Record<string, { name: string; value: number }> = {};
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  for (const item of orderItems) {
    const productId = item.variant.product.id;
    const productName = item.variant.product.name;

    if (!productMap[productId]) {
      productMap[productId] = { name: productName, value: 0 };
    }

    productMap[productId].value += Number(item.totalPrice);
  }

  return Object.values(productMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((product, index) => ({
      name: product.name,
      value: product.value,
      color: colors[index % colors.length],
    }));
}

export const analyticsResolvers = {
  Query: {
    getOverviewAnalytics: async (
      _: unknown,
      { period }: { period: string },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);
      const prisma = ctx.prisma;
      const sellerId = user.id;

      if (!sellerId) throw new Error("Seller ID not found");

      const dateRange = getDateRange(period);

      // Get revenue metrics
      const [currentRevenue, previousRevenue] = await Promise.all([
        prisma.sellerOrder.aggregate({
          where: {
            sellerId,
            status: "DELIVERED",
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
          _sum: { total: true },
        }),
        prisma.sellerOrder.aggregate({
          where: {
            sellerId,
            status: "DELIVERED",
            createdAt: { gte: dateRange.previousStart, lt: dateRange.previousEnd },
          },
          _sum: { total: true },
        }),
      ]);

      const currentRev = Number(currentRevenue._sum.total ?? 0);
      const previousRev = Number(previousRevenue._sum.total ?? 0);

      // Get orders metrics
      const [currentOrders, previousOrders] = await Promise.all([
        prisma.sellerOrder.count({
          where: {
            sellerId,
            status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
        }),
        prisma.sellerOrder.count({
          where: {
            sellerId,
            status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
            createdAt: { gte: dateRange.previousStart, lt: dateRange.previousEnd },
          },
        }),
      ]);

      // Get conversion rate (simplified: orders / unique visitors approximation)
      // For now, we'll use a placeholder calculation
      const conversionRate = currentOrders > 0 ? (currentOrders / (currentOrders * 10)) * 100 : 0;
      const prevConversionRate = previousOrders > 0 ? (previousOrders / (previousOrders * 10)) * 100 : 0;

      // Get customer satisfaction (average rating)
      const [currentRatings, previousRatings] = await Promise.all([
        prisma.review.aggregate({
          where: {
            product: { sellerId },
            status: "APPROVED",
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
          _avg: { rating: true },
        }),
        prisma.review.aggregate({
          where: {
            product: { sellerId },
            status: "APPROVED",
            createdAt: { gte: dateRange.previousStart, lt: dateRange.previousEnd },
          },
          _avg: { rating: true },
        }),
      ]);

      const currentRating = Number(currentRatings._avg.rating ?? 0);
      const previousRating = Number(previousRatings._avg.rating ?? 0);

      // Get sales data points
      const salesData = await getSalesDataPoints(prisma, sellerId, period, dateRange);

      // Get top products data
      const productData = await getTopProductsData(prisma, sellerId, dateRange);

      return {
        metrics: {
          totalRevenue: {
            current: currentRev,
            previous: previousRev,
            percentChange: calculatePercentChange(currentRev, previousRev),
            formatted: formatCurrency(currentRev),
          },
          orders: {
            current: currentOrders,
            previous: previousOrders,
            percentChange: calculatePercentChange(currentOrders, previousOrders),
          },
          conversionRate: {
            current: conversionRate,
            previous: prevConversionRate,
            percentChange: calculatePercentChange(conversionRate, prevConversionRate),
          },
          customerSatisfaction: {
            current: currentRating,
            previous: previousRating,
            percentChange: calculatePercentChange(currentRating, previousRating),
          },
        },
        salesData,
        productData,
      };
    },

    getSalesAnalytics: async (
      _: unknown,
      { period }: { period: string },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);
      const prisma = ctx.prisma;
      const sellerId = user.id;

      if (!sellerId) throw new Error("Seller ID not found");

      const dateRange = getDateRange(period);
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Daily sales
      const dailyRevenue = await prisma.sellerOrder.aggregate({
        where: {
          sellerId,
          status: "DELIVERED",
          createdAt: { gte: todayStart, lte: now },
        },
        _sum: { total: true },
      });

      // Weekly sales
      const weeklyRevenue = await prisma.sellerOrder.aggregate({
        where: {
          sellerId,
          status: "DELIVERED",
          createdAt: { gte: weekStart, lte: now },
        },
        _sum: { total: true },
      });

      // Monthly sales
      const monthlyRevenue = await prisma.sellerOrder.aggregate({
        where: {
          sellerId,
          status: "DELIVERED",
          createdAt: { gte: monthStart, lte: now },
        },
        _sum: { total: true },
      });

      // Average order value
      const orders = await prisma.sellerOrder.findMany({
        where: {
          sellerId,
          status: "DELIVERED",
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        select: { total: true },
      });

      const totalRevenue = orders.reduce((sum: number, order: { total: any }) => sum + Number(order.total), 0);
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Previous period averages for comparison
      const prevOrders = await prisma.sellerOrder.findMany({
        where: {
          sellerId,
          status: "DELIVERED",
          createdAt: { gte: dateRange.previousStart, lt: dateRange.previousEnd },
        },
        select: { total: true },
      });

      const prevTotalRevenue = prevOrders.reduce((sum: number, order: { total: any }) => sum + Number(order.total), 0);
      const prevAvgOrderValue = prevOrders.length > 0 ? prevTotalRevenue / prevOrders.length : 0;

      // Sales trends
      const salesTrends = await getSalesDataPoints(prisma, sellerId, period, dateRange);

      return {
        metrics: {
          dailySales: {
            current: Number(dailyRevenue._sum.total ?? 0),
            previous: 0, // Can be calculated if needed
            percentChange: 0,
            formatted: formatCurrency(Number(dailyRevenue._sum.total ?? 0)),
          },
          weeklySales: {
            current: Number(weeklyRevenue._sum.total ?? 0),
            previous: 0,
            percentChange: 0,
            formatted: formatCurrency(Number(weeklyRevenue._sum.total ?? 0)),
          },
          monthlySales: {
            current: Number(monthlyRevenue._sum.total ?? 0),
            previous: 0,
            percentChange: 0,
            formatted: formatCurrency(Number(monthlyRevenue._sum.total ?? 0)),
          },
          averageOrderValue: {
            current: avgOrderValue,
            previous: prevAvgOrderValue,
            percentChange: calculatePercentChange(avgOrderValue, prevAvgOrderValue),
            formatted: formatCurrency(avgOrderValue),
          },
        },
        salesTrends,
      };
    },

    getProductsAnalytics: async (
      _: unknown,
      { period }: { period: string },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);
      const prisma = ctx.prisma;
      const sellerId = user.id;

      if (!sellerId) throw new Error("Seller ID not found");

      // Total products
      const totalProducts = await prisma.product.count({
        where: { sellerId, status: "ACTIVE" },
      });

      // Low stock (less than 10)
      const lowStock = await prisma.productVariant.count({
        where: {
          product: { sellerId },
          stock: { lt: 10, gt: 0 },
        },
      });

      // Out of stock
      const outOfStock = await prisma.productVariant.count({
        where: {
          product: { sellerId },
          stock: 0,
        },
      });

      // Best seller rate (products with sales)
      const dateRange = getDateRange(period);
      const soldProducts = await prisma.sellerOrderItem.findMany({
        where: {
          sellerOrder: {
            sellerId,
            status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
        },
        select: { variantId: true },
        distinct: ["variantId"],
      });

      const bestSellerRate = totalProducts > 0 ? (soldProducts.length / totalProducts) * 100 : 0;

      // Product performance
      const orderItems = await prisma.sellerOrderItem.findMany({
        where: {
          sellerOrder: {
            sellerId,
            status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
        },
        select: {
          quantity: true,
          totalPrice: true,
          variant: {
            select: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const productPerformanceMap: Record<
        string,
        { productId: string; productName: string; sales: number; revenue: number; orders: number }
      > = {};

      for (const item of orderItems as any[]) {
        const productId = item.variant.product.id;
        const productName = item.variant.product.name;

        if (!productPerformanceMap[productId]) {
          productPerformanceMap[productId] = {
            productId,
            productName,
            sales: 0,
            revenue: 0,
            orders: 0,
          };
        }

        productPerformanceMap[productId].sales += item.quantity;
        productPerformanceMap[productId].revenue += Number(item.totalPrice);
        productPerformanceMap[productId].orders += 1;
      }

      const productPerformance = Object.values(productPerformanceMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        metrics: {
          totalProducts,
          lowStock,
          outOfStock,
          bestSellerRate: Number(bestSellerRate.toFixed(2)),
        },
        productPerformance,
      };
    },

    getCustomersAnalytics: async (
      _: unknown,
      { period }: { period: string },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);
      const prisma = ctx.prisma;
      const sellerId = user.id;

      if (!sellerId) throw new Error("Seller ID not found");

      const dateRange = getDateRange(period);

      // Get unique customers in current period
      const currentOrders = await prisma.sellerOrder.findMany({
        where: {
          sellerId,
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        select: { buyerOrderId: true },
      });

      const buyerIds = new Set<string>();
      for (const order of currentOrders) {
        const buyerOrder = await prisma.order.findUnique({
          where: { id: order.buyerOrderId },
          select: { buyerId: true },
        });
        if (buyerOrder) buyerIds.add(buyerOrder.buyerId);
      }

      const totalCustomers = buyerIds.size;

      // New customers (first order in this period)
      const allBuyerIds = Array.from(buyerIds);
      let newCustomers = 0;

      for (const buyerId of allBuyerIds) {
        const firstOrder = await prisma.order.findFirst({
          where: {
            buyerId,
            sellerOrders: { some: { sellerId } },
          },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        });

        if (firstOrder && firstOrder.createdAt >= dateRange.start) {
          newCustomers++;
        }
      }

      // Repeat customer rate
      const previousOrders = await prisma.sellerOrder.findMany({
        where: {
          sellerId,
          createdAt: { gte: dateRange.previousStart, lt: dateRange.previousEnd },
        },
        select: { buyerOrderId: true },
      });

      const prevBuyerIds = new Set<string>();
      for (const order of previousOrders) {
        const buyerOrder = await prisma.order.findUnique({
          where: { id: order.buyerOrderId },
          select: { buyerId: true },
        });
        if (buyerOrder) prevBuyerIds.add(buyerOrder.buyerId);
      }

      const repeatCustomers = Array.from(buyerIds).filter((id) => prevBuyerIds.has(id)).length;
      const repeatCustomerRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

      // Average lifetime value
      let totalLTV = 0;
      for (const buyerId of allBuyerIds) {
        const customerOrders = await prisma.sellerOrder.aggregate({
          where: {
            sellerId,
            order: { buyerId },
            status: "DELIVERED",
          },
          _sum: { total: true },
        });
        totalLTV += Number(customerOrders._sum.total ?? 0);
      }

      const averageLifetimeValue = totalCustomers > 0 ? totalLTV / totalCustomers : 0;

      // Customer acquisition data
      const acquisitionData = await getSalesDataPoints(prisma, sellerId, period, dateRange);
      const customerAcquisition = acquisitionData.map((point) => ({
        name: point.name,
        customers: Math.floor(point.orders * 0.8), // Approximation
      }));

      return {
        metrics: {
          totalCustomers,
          newCustomers,
          repeatCustomerRate: Number(repeatCustomerRate.toFixed(2)),
          averageLifetimeValue: Number(averageLifetimeValue.toFixed(2)),
        },
        customerAcquisition,
      };
    },
  },
};

