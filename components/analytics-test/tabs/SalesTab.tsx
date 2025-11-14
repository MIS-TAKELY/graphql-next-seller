"use client"

import { DollarSign, ShoppingCart } from "lucide-react"
import { MetricCard } from "../MetricCard"
import { SalesTrendsChart } from "../charts/SalesTrendsChart"

interface SalesTabProps {
  salesData: any[]
}

export function SalesTab({ salesData }: SalesTabProps) {
  const salesMetrics = [
    {
      title: "Daily Sales",
      value: "$1,234",
      description: "Today's sales",
      icon: DollarSign
    },
    {
      title: "Weekly Sales",
      value: "$8,642",
      description: "This week's sales",
      icon: DollarSign
    },
    {
      title: "Monthly Sales",
      value: "$45,231",
      description: "This month's sales",
      icon: DollarSign
    },
    {
      title: "Average Order",
      value: "$89.50",
      description: "Average order value",
      icon: ShoppingCart
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {salesMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
      <SalesTrendsChart data={salesData} />
    </div>
  )
}