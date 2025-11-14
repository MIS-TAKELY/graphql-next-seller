// components/analytics/CustomersTab.tsx
"use client";
import { GET_CUSTOMERS_ANALYTICS } from "@/client/analytics/analytics.queries";
import { useQuery } from "@apollo/client";
import { DollarSign, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import { ChartTooltip, ChartTooltipContent } from "../ui/chart";

type TimePeriod = "DAYS_7" | "DAYS_30" | "DAYS_90" | "YEAR_1";

type CustomersTabProps = {
  period: TimePeriod;
  chartConfig: any;
};

export default function CustomersTab({ period, chartConfig }: CustomersTabProps) {
  const { data, loading, error } = useQuery(GET_CUSTOMERS_ANALYTICS, {
    variables: { period },
    fetchPolicy: "cache-and-network",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading customers data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error loading customers: {error.message}</p>
      </div>
    );
  }

  const analytics = data?.getCustomersAnalytics;
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const { metrics, customerAcquisition } = analytics;
  return (
    <>
      <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-300 ease-in-out">
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          description="Registered customers"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="New Customers"
          value={`+${metrics.newCustomers.toLocaleString()}`}
          description="This period"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Repeat Customers"
          value={`${metrics.repeatCustomerRate.toFixed(1)}%`}
          description="Return rate"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Customer LTV"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(metrics.averageLifetimeValue)}
          description="Average lifetime value"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <ChartCard
        title="Customer Acquisition"
        description="New customer acquisition over time"
        chartConfig={chartConfig}
        className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
      >
        <AreaChart data={customerAcquisition}>
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
          <Area
            type="monotone"
            dataKey="customers"
            stroke="var(--color-orders)"
            fill="var(--color-orders)"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ChartCard>
    </>
  );
}
