// components/analytics/SalesTab.tsx
"use client";
import { GET_SALES_ANALYTICS } from "@/client/analytics/analytics.queries";
import { useQuery } from "@apollo/client";
import { Banknote, ShoppingCart } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import { ChartTooltip, ChartTooltipContent } from "../ui/chart";

type TimePeriod = "DAYS_7" | "DAYS_30" | "DAYS_90" | "YEAR_1";

type SalesTabProps = {
  period: TimePeriod;
  chartConfig: any;
};

export default function SalesTab({ period, chartConfig }: SalesTabProps) {
  const { data, loading, error } = useQuery(GET_SALES_ANALYTICS, {
    variables: { period },
    fetchPolicy: "cache-and-network",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error loading sales: {error.message}</p>
      </div>
    );
  }

  const analytics = data?.getSalesAnalytics;
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const { metrics, salesTrends } = analytics;
  return (
    <>
      <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-300 ease-in-out">
        <MetricCard
          title="Daily Sales"
          value={metrics.dailySales.formatted}
          description="Today's sales"
          icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Weekly Sales"
          value={metrics.weeklySales.formatted}
          description="This week's sales"
          icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Monthly Sales"
          value={metrics.monthlySales.formatted}
          description="This month's sales"
          icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Average Order"
          value={metrics.averageOrderValue.formatted}
          description="Average order value"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <ChartCard
        title="Sales Trends"
        description="Monthly sales and order trends"
        chartConfig={chartConfig}
        className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
      >
        <LineChart data={salesTrends}>
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
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            className="text-xs sm:text-sm"
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="var(--color-sales)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="var(--color-orders)"
            strokeWidth={2}
          />
        </LineChart>
      </ChartCard>
    </>
  );
}
