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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface CustomerAcquisitionChartProps {
  data: any[];
}

const chartConfig = {
  orders: {
    label: "New Customers",
    color: "hsl(var(--chart-3))",
  },
};

export function CustomerAcquisitionChart({
  data,
}: CustomerAcquisitionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Acquisition</CardTitle>
        <CardDescription>New customer acquisition over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="var(--color-orders)"
              fill="var(--color-orders)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
