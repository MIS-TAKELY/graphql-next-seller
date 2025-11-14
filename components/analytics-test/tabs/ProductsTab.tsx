"use client"

import { Package, TrendingUp } from "lucide-react"
import { MetricCard } from "../MetricCard"
import { ProductPerformanceChart } from "../charts/ProductPerformanceChart"

interface ProductsTabProps {
  salesData: any[]
  productData: any[]
}

export function ProductsTab({ salesData, productData }: ProductsTabProps) {
  const productMetrics = [
    {
      title: "Total Products",
      value: "1,234",
      description: "Active products",
      icon: Package
    },
    {
      title: "Low Stock",
      value: "23",
      description: "Products low in stock",
      icon: Package
    },
    {
      title: "Out of Stock",
      value: "5",
      description: "Products out of stock",
      icon: Package
    },
    {
      title: "Best Seller",
      value: "87%",
      description: "Fulfillment rate",
      icon: TrendingUp
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {productMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
      <ProductPerformanceChart data={salesData} />
    </div>
  )
}