"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface RevenueChartProps {
  data: any[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
};

export function RevenueChart({ data }: RevenueChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-4">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[250px] sm:h-[300px] md:h-[350px]"
        >
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: isMobile ? 10 : 30,
              left: isMobile ? 0 : 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              fontSize={isMobile ? 10 : 12}
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              fontSize={isMobile ? 10 : 12}
              tick={{ fill: "hsl(var(--foreground))" }}
              width={isMobile ? 30 : 40}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="var(--color-revenue)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
