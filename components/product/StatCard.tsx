"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  isLoading?: boolean;
  valueClassName?: string;
}

export function StatCard({
  title,
  value,
  description,
  isLoading = false,
  valueClassName = "",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>
          {isLoading ? (
            <div className="h-6 w-10 bg-gray-200 animate-pulse rounded mb-1" />
          ) : (
            <p>{value}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
