"use client";
import { DASHBOARD_GET_MONTHLY_SALES } from "@/client/dashboard/dashboard.query";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  total: {
    label: "Total Sales",
    color: "hsl(var(--chart-1))",
  },
};

export function SalesChart() {
  let data = [];
  const {
    data: monthlySalesResponse,
    loading,
    error,
  } = useQuery(DASHBOARD_GET_MONTHLY_SALES, {
    variables: {
      year: 2025,
    },
  });
  if (error) console.log("error-->", error);
  if (!loading) {
    data = monthlySalesResponse?.getMonthlySales || [];
  }
  // Calculate dynamic Y-axis domain
  const yAxisDomain = useMemo(() => {
    if (!data.length) return [0, 100];

    const values = data.map((item:any) => item.total);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const paddedMax = Math.ceil((maxValue * 1.1) / 100) * 100;
    const paddedMin = Math.floor((minValue * 0.9) / 100) * 100;

    return [Math.max(0, paddedMin), paddedMax];
  }, [data]);

  // Generate nice tick values for Y-axis
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
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={yAxisDomain}
            ticks={yAxisTicks}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `$${value.toLocaleString()}`}
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
