// components/analytics/ProductsTab.tsx
"use client";
import { GET_PRODUCTS_ANALYTICS } from "@/client/analytics/analytics.queries";
import { useQuery } from "@apollo/client";
import { Package, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import { ChartTooltip, ChartTooltipContent } from "../ui/chart";

type TimePeriod = "DAYS_7" | "DAYS_30" | "DAYS_90" | "YEAR_1";

type ProductsTabProps = {
  period: TimePeriod;
  chartConfig: any;
};

export default function ProductsTab({ period, chartConfig }: ProductsTabProps) {
  const { data, loading, error } = useQuery(GET_PRODUCTS_ANALYTICS, {
    variables: { period },
    fetchPolicy: "cache-and-network",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading products data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error loading products: {error.message}</p>
      </div>
    );
  }

  const analytics = data?.getProductsAnalytics;
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const { metrics, productPerformance } = analytics;

  // Transform product performance for chart
  const chartData = productPerformance.slice(0, 10).map((product: any) => ({
    name: product.productName.length > 15 
      ? product.productName.substring(0, 15) + "..." 
      : product.productName,
    sales: product.sales,
    revenue: product.revenue,
  }));
  return (
    <>
      <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-300 ease-in-out">
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts.toLocaleString()}
          description="Active products"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Low Stock"
          value={metrics.lowStock.toLocaleString()}
          description="Products low in stock"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStock.toLocaleString()}
          description="Products out of stock"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Best Seller"
          value={`${metrics.bestSellerRate.toFixed(1)}%`}
          description="Fulfillment rate"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <ChartCard
        title="Product Performance"
        description="Top selling products by revenue"
        chartConfig={chartConfig}
        className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
      >
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            className="text-xs sm:text-sm"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-xs sm:text-sm"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="sales"
            fill="var(--color-sales)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartCard>
    </>
  );
}
