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
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";

interface SalesTrendsChartProps {
  data: any[];
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-3))",
  },
};

export function SalesTrendsChart({ data }: SalesTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trends</CardTitle>
        <CardDescription>Monthly sales and order trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
