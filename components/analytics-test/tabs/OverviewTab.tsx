"use client"

import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { MetricCard } from "../MetricCard"
import { RevenueChart } from "../charts/RevenueChart"
import { TopProductsChart } from "../charts/TopProductsChart"

interface OverviewTabProps {
  salesData: any[]
  productData: any[]
}

export function OverviewTab({ salesData, productData }: OverviewTabProps) {
  const metrics = [
    {
      title: "Total Revenue",
      value: "रू 45,231.89",
      icon: DollarSign,
      trend: { value: "+20.1% from last month", isPositive: true }
    },
    {
      title: "Orders",
      value: "+2,350",
      icon: ShoppingCart,
      trend: { value: "+180.1% from last month", isPositive: true }
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      icon: TrendingUp,
      trend: { value: "-2.1% from last month", isPositive: false }
    },
    {
      title: "Customer Satisfaction",
      value: "4.8/5",
      icon: Users,
      trend: { value: "+0.2 from last month", isPositive: true }
    }
  ]

  return (
    <div className="space-y-4 w-full">
      {/* Metrics Grid - Responsive from 1 to 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Grid - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <div className="lg:col-span-4 w-full">
          <RevenueChart data={salesData} />
        </div>
        <div className="lg:col-span-3 w-full">
          <TopProductsChart data={productData} />
        </div>
      </div>
    </div>
  )
}