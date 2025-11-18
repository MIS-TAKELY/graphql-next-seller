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
import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart } from "recharts";

interface TopProductsChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

// Create chart config from data
const createChartConfig = (data: TopProductsChartProps["data"]) => {
  return data.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.color,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);
};

export function TopProductsChart({ data }: TopProductsChartProps) {
  const [radius, setRadius] = useState({ outer: 80, inner: 0 });
  const [showLegend, setShowLegend] = useState(false);
  const chartConfig = createChartConfig(data);

  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setRadius({ outer: 60, inner: 0 });
        setShowLegend(true);
      } else if (width < 768) {
        setRadius({ outer: 70, inner: 0 });
        setShowLegend(false);
      } else {
        setRadius({ outer: 80, inner: 0 });
        setShowLegend(false);
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg">Top Products</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Sales distribution by product
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-4">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[250px] sm:h-[300px] md:h-[350px]"
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                !showLegend
                  ? `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  : `${((percent ?? 0) * 100).toFixed(0)}%`
              }
              outerRadius={radius.outer}
              fill="#8884d8"
              dataKey="value"
              className="text-[10px] sm:text-xs"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: "10px" }}
              />
            )}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
