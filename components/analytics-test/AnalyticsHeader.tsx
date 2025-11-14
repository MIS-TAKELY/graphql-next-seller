"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function AnalyticsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      <div className="flex items-center space-x-2">
        <Select defaultValue="30days">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>
  )
}