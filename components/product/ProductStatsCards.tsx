"use client";

import { Product } from "@/types/pages/product";
import type { ProductVariant } from "@/types/product/product.types";
import { StatCard } from "./StatCard";

interface ProductStatsCardsProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductStatsCards({
  products,
  isLoading,
}: ProductStatsCardsProps) {
  const totalProducts = products.length;
  
  const activeProducts = products.filter(
    (product) => product.status === "ACTIVE"
  ).length;

  const outOfStockProducts = products.filter((product) =>
    product.variants?.some((variant: ProductVariant) => variant.stock === 0)
  ).length;

  const lowStockProducts = products.filter((product) =>
    product.variants?.some((variant: ProductVariant) => variant.stock <= 10)
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Products"
        value={totalProducts}
        description="All products in inventory"
        isLoading={isLoading}
      />
      <StatCard
        title="Active Products"
        value={activeProducts}
        description="Currently available"
        isLoading={isLoading}
        valueClassName="text-green-600"
      />
      <StatCard
        title="Out of Stock"
        value={outOfStockProducts}
        description="Need restocking"
        isLoading={isLoading}
        valueClassName="text-red-600"
      />
      <StatCard
        title="Low Stock"
        value={lowStockProducts}
        description="Running low"
        isLoading={isLoading}
        valueClassName="text-orange-600"
      />
    </div>
  );
}