"use client";
import { DASHBOARD_GET_MONTHLY_SALES } from "@/client/dashboard/dashboard.query";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@apollo/client";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";

const chartConfig = {
  total: {
    label: "Total Sales",
    color: "hsl(var(--chart-1))",
  },
};

export function SalesChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: monthlySalesResponse,
    loading,
    error,
  } = useQuery(DASHBOARD_GET_MONTHLY_SALES, {
    variables: {
      year: 2025,
    },
    skip: !mounted, // Only fetch once mounted to be safe or keep it if it works with apollo-ssr
  });

  if (error) console.log("error-->", error);

  const data = monthlySalesResponse?.getMonthlySales || [];

  // Calculate dynamic Y-axis domain
  const yAxisDomain = useMemo(() => {
    if (!data.length) return [0, 100];

    const values = data.map((item: any) => item.total);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const paddedMax = Math.ceil((maxValue * 1.1) / 100) * 100;
    const paddedMin = Math.floor((minValue * 0.9) / 100) * 100;

    return [Math.max(0, paddedMin), paddedMax];
  }, [data]);

  // Generate nice tick values for Y-axis
  const yAxisTicks = useMemo(() => {
    const [min, max] = yAxisDomain;

    // Prevent invalid values
    if (!isFinite(min) || !isFinite(max) || min === max) {
      return [0, 100, 200, 300, 400, 500]; // fallback ticks
    }

    const tickCount = 5;
    let step = Math.ceil((max - min) / tickCount / 100) * 100;

    // Ensure step is not zero or NaN
    if (!isFinite(step) || step <= 0) {
      step = Math.max(100, (max - min) / tickCount);
    }

    const ticks = [];
    for (let i = min; i <= max; i += step) {
      ticks.push(i);
    }

    return ticks;
  }, [yAxisDomain]);

  if (!mounted) {
    return <div className="h-[350px] w-full animate-pulse bg-muted/50 rounded-lg" />;
  }

  return (
    <div className="w-full h-[350px]">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `रू ${value.toLocaleString()}`}
            domain={yAxisDomain}
            ticks={yAxisTicks}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `रू ${value.toLocaleString()}`}
              />
            }
          />
          <Bar
            dataKey="total"
            fill="var(--color-total)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
