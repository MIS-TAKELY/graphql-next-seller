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
  return `रू ${amount.toLocaleString()}`;
}

// Helper to calculate percentage change
function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous) * 100);
}

// Helper to get sales data points grouped by time period using SQL
async function getSalesDataPoints(
  prisma: any,
  sellerId: string,
  period: string,
  dateRange: DateRange
): Promise<any[]> {
  const { start, end } = dateRange;
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Determine grouping interval
  let groupInterval: string;
  if (daysDiff > 90) {
    groupInterval = "YYYY-MM"; // Month
  } else if (daysDiff > 30) {
    groupInterval = "YYYY-IW"; // Week
  } else {
    groupInterval = "YYYY-MM-DD"; // Day
  }

  // Use raw SQL for efficient aggregation
  const salesData = await prisma.$queryRaw`
    SELECT 
      TO_CHAR(so."createdAt", 'Mon YYYY') as name,
      COUNT(DISTINCT so.id) as orders,
      COALESCE(SUM(so.total), 0)::numeric as revenue,
      COALESCE(SUM(COALESCE(si.quantity, 0)), 0)::int as sales
    FROM "seller_orders" so
    LEFT JOIN "seller_order_items" si ON si."sellerOrderId" = so.id
    WHERE so."sellerId" = ${sellerId}
      AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
      AND so."createdAt" >= ${start}
      AND so."createdAt" <= ${end}
    GROUP BY TO_CHAR(so."createdAt", ${groupInterval}), TO_CHAR(so."createdAt", 'Mon YYYY')
    ORDER BY MIN(so."createdAt")
  ` as Array<{ name: string; orders: bigint; revenue: number; sales: bigint }>;

  return salesData.map(row => ({
    name: row.name,
    orders: Number(row.orders),
    revenue: Number(row.revenue),
    sales: Number(row.sales),
  }));
}

// Helper to get top products data using SQL aggregation
async function getTopProductsData(
  prisma: any,
  sellerId: string,
  dateRange: DateRange
): Promise<any[]> {
  const { start, end } = dateRange;
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  // Use raw SQL for efficient aggregation
  const topProducts = await prisma.$queryRaw`
    SELECT 
      p.id as "productId",
      p.name as "productName",
      COALESCE(SUM(si."totalPrice"), 0)::numeric as value
    FROM "seller_order_items" si
    JOIN "seller_orders" so ON si."sellerOrderId" = so.id
    JOIN "product_variants" pv ON si."variantId" = pv.id
    JOIN products p ON pv."productId" = p.id
    WHERE so."sellerId" = ${sellerId}
      AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
      AND so."createdAt" >= ${start}
      AND so."createdAt" <= ${end}
    GROUP BY p.id, p.name
    ORDER BY value DESC
    LIMIT 5
  ` as Array<{ productId: string; productName: string; value: number }>;

  return topProducts.map((product, index) => ({
    name: product.productName,
    value: Number(product.value),
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

      // Use raw SQL for efficient customer analytics - single query instead of N+1
      const customerStats = await prisma.$queryRaw`
        -- Current period customers
        WITH current_customers AS (
          SELECT DISTINCT o."buyerId"
          FROM "seller_orders" so
          JOIN orders o ON so."buyerOrderId" = o.id
          WHERE so."sellerId" = ${sellerId}
            AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
            AND so."createdAt" >= ${dateRange.start}
            AND so."createdAt" <= ${dateRange.end}
        ),
        -- Previous period customers
        prev_customers AS (
          SELECT DISTINCT o."buyerId"
          FROM "seller_orders" so
          JOIN orders o ON so."buyerOrderId" = o.id
          WHERE so."sellerId" = ${sellerId}
            AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
            AND so."createdAt" >= ${dateRange.previousStart}
            AND so."createdAt" < ${dateRange.previousEnd}
        ),
        -- First order dates for current customers
        customer_first_order AS (
          SELECT o."buyerId", MIN(so."createdAt") as first_order_date
          FROM "seller_orders" so
          JOIN orders o ON so."buyerOrderId" = o.id
          WHERE so."sellerId" = ${sellerId}
            AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          GROUP BY o."buyerId"
        )
        SELECT 
          (SELECT COUNT(*) FROM current_customers)::int as "totalCustomers",
          (SELECT COUNT(*) FROM customer_first_order cfo 
           WHERE cfo.first_order_date >= ${dateRange.start})::int as "newCustomers",
          (SELECT COUNT(*) FROM current_customers cc 
           WHERE EXISTS (SELECT 1 FROM prev_customers pc WHERE pc."buyerId" = cc."buyerId"))::int as "repeatCustomers",
          (SELECT COALESCE(AVG(lifetime_value), 0)::numeric(12,2)
           FROM (
             SELECT o."buyerId", SUM(so.total)::numeric as lifetime_value
             FROM "seller_orders" so
             JOIN orders o ON so."buyerOrderId" = o.id
             WHERE so."sellerId" = ${sellerId}
               AND so.status = 'DELIVERED'
             GROUP BY o."buyerId"
           ) as ltv) as "averageLifetimeValue"
      ` as Array<{
        totalCustomers: number;
        newCustomers: number;
        repeatCustomers: number;
        averageLifetimeValue: number;
      }>;

      const stats = customerStats[0] ?? { totalCustomers: 0, newCustomers: 0, repeatCustomers: 0, averageLifetimeValue: 0 };
      const totalCustomers = stats.totalCustomers;
      const repeatCustomerRate = totalCustomers > 0 ? (stats.repeatCustomers / totalCustomers) * 100 : 0;

      // Customer acquisition data using optimized query
      const acquisitionData = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(so."createdAt", 'Mon YYYY') as name,
          COUNT(DISTINCT o."buyerId") as customers
        FROM "seller_orders" so
        JOIN orders o ON so."buyerOrderId" = o.id
        WHERE so."sellerId" = ${sellerId}
          AND so.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND so."createdAt" >= ${dateRange.start}
          AND so."createdAt" <= ${dateRange.end}
        GROUP BY TO_CHAR(so."createdAt", 'YYYY-MM')
        ORDER BY MIN(so."createdAt")
      ` as Array<{ name: string; customers: bigint }>;

      const customerAcquisition = acquisitionData.map(row => ({
        name: row.name,
        customers: Number(row.customers),
      }));

      return {
        metrics: {
          totalCustomers,
          newCustomers: stats.newCustomers,
          repeatCustomerRate: Number(repeatCustomerRate.toFixed(2)),
          averageLifetimeValue: Number(stats.averageLifetimeValue) || 0,
        },
        customerAcquisition,
      };
    },
  },
};

