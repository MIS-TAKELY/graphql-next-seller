"use client"
import { Users, DollarSign } from "lucide-react"
import { MetricCard } from "../MetricCard"
import { CustomerAcquisitionChart } from "../charts/CustomerAcquisitionChart"

interface CustomersTabProps {
  salesData: any[]
}

export function CustomersTab({ salesData }: CustomersTabProps) {
  const customerMetrics = [
    {
      title: "Total Customers",
      value: "2,350",
      description: "Registered customers",
      icon: Users
    },
    {
      title: "New Customers",
      value: "+180",
      description: "This month",
      icon: Users
    },
    {
      title: "Repeat Customers",
      value: "68%",
      description: "Return rate",
      icon: Users
    },
    {
      title: "Customer LTV",
      value: "$324",
      description: "Average lifetime value",
      icon: DollarSign
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {customerMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
      <CustomerAcquisitionChart data={salesData} />
    </div>
  )
}