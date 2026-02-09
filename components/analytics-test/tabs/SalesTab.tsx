"use client"

import { Banknote, ShoppingCart } from "lucide-react"
import { MetricCard } from "../MetricCard"
import { SalesTrendsChart } from "../charts/SalesTrendsChart"

interface SalesTabProps {
  salesData: any[]
}

export function SalesTab({ salesData }: SalesTabProps) {
  const salesMetrics = [
    {
      title: "Daily Sales",
      value: "रू 1,234",
      description: "Today's sales",
      icon: Banknote
    },
    {
      title: "Weekly Sales",
      value: "रू 8,642",
      description: "This week's sales",
      icon: Banknote
    },
    {
      title: "Monthly Sales",
      value: "रू 45,231",
      description: "This month's sales",
      icon: Banknote
    },
    {
      title: "Average Order",
      value: "रू 89.50",
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