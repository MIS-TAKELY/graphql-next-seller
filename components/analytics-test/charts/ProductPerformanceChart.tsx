"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface ProductPerformanceChartProps {
  data: any[];
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
};

export function ProductPerformanceChart({
  data,
}: ProductPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
        <CardDescription>Top selling products by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
