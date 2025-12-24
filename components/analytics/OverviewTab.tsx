// components/analytics/OverviewTab.tsx
"use client";
import { GET_OVERVIEW_ANALYTICS } from "@/client/analytics/analytics.queries";
import { useQuery } from "@apollo/client";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip, ChartTooltipContent } from "../ui/chart";
import ChartCard from "./ChartCard";
import MetricCard from "./MetricCard";

type TimePeriod = "DAYS_7" | "DAYS_30" | "DAYS_90" | "YEAR_1";

type OverviewTabProps = {
  period: TimePeriod;
  chartConfig: any;
};

export default function OverviewTab({ period, chartConfig }: OverviewTabProps) {
  const { data, loading, error } = useQuery(GET_OVERVIEW_ANALYTICS, {
    variables: { period },
    fetchPolicy: "cache-and-network",
  });
  const [pieRadius, setPieRadius] = useState(50);

  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      if (width < 380) {
        setPieRadius(40);
      } else if (width < 640) {
        setPieRadius(50);
      } else if (width < 1024) {
        setPieRadius(60);
      } else {
        setPieRadius(70);
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">
          Error loading analytics: {error.message}
        </p>
      </div>
    );
  }

  const analytics = data?.getOverviewAnalytics;
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const { metrics, salesData, productData } = analytics;

  const formatValue = (
    value: number,
    type: "currency" | "number" | "percent" = "number"
  ) => {
    if (type === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    }
    if (type === "percent") {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const formatTrend = (percentChange: number) => {
    const sign = percentChange >= 0 ? "+" : "";
    return `${sign}${percentChange.toFixed(1)}%`;
  };

  return (
    <>
      <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-300 ease-in-out">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue.formatted}
          description={`${formatTrend(
            metrics.totalRevenue.percentChange
          )} from previous period`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: formatTrend(metrics.totalRevenue.percentChange),
            isPositive: metrics.totalRevenue.percentChange >= 0,
          }}
        />
        <MetricCard
          title="Orders"
          value={formatValue(metrics.orders.current)}
          description={`${formatTrend(
            metrics.orders.percentChange
          )} from previous period`}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: formatTrend(metrics.orders.percentChange),
            isPositive: metrics.orders.percentChange >= 0,
          }}
        />
        <MetricCard
          title="Conversion Rate"
          value={formatValue(metrics.conversionRate.current, "percent")}
          description={`${formatTrend(
            metrics.conversionRate.percentChange
          )} from previous period`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: formatTrend(metrics.conversionRate.percentChange),
            isPositive: metrics.conversionRate.percentChange >= 0,
          }}
        />
        <MetricCard
          title="Customer Satisfaction"
          value={`${metrics.customerSatisfaction.current.toFixed(1)}/5`}
          description={`${formatTrend(
            metrics.customerSatisfaction.percentChange
          )} from previous period`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: formatTrend(metrics.customerSatisfaction.percentChange),
            isPositive: metrics.customerSatisfaction.percentChange >= 0,
          }}
        />
      </div>
      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-2 transition-all duration-300 ease-in-out">
        <ChartCard
          title="Revenue Overview"
          chartConfig={chartConfig}
          className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px]"
        >
          <AreaChart
            data={salesData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="text-xs sm:text-sm"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-xs sm:text-sm" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="var(--color-revenue)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartCard>
        <ChartCard
          title="Top Products"
          description="Sales distribution by product"
          chartConfig={chartConfig}
          className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px]"
        >
          <PieChart>
            <Pie
              data={productData}
              cx="50%"
              cy="50%"
              outerRadius={pieRadius}
              fill="#8884d8"
              dataKey="value"
              label={{ fontSize: 12 }}
            >
              {productData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>
      </div>
    </>
  );
}
