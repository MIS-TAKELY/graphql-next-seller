"use client";

import { useProductStats } from "@/hooks/product/useProduct";
import { StatCard } from "./StatCard";

export function ProductStatsCards() {
  const { stats, isLoading } = useProductStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Products"
        value={stats?.total || 0}
        description="All products in inventory"
        isLoading={isLoading}
      />
      <StatCard
        title="Active Products"
        value={stats?.active || 0}
        description="Currently available"
        isLoading={isLoading}
        valueClassName="text-green-600"
      />
      <StatCard
        title="Out of Stock"
        value={stats?.outOfStock || 0}
        description="Need restocking"
        isLoading={isLoading}
        valueClassName="text-red-600"
      />
      <StatCard
        title="Low Stock"
        value={stats?.lowStock || 0}
        description="Running low"
        isLoading={isLoading}
        valueClassName="text-orange-600"
      />
    </div>
  );
}