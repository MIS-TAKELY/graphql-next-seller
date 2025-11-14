// components/analytics/Header.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

type TimePeriod = "DAYS_7" | "DAYS_30" | "DAYS_90" | "YEAR_1";

type HeaderProps = {
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
};

export default function Header({ period, onPeriodChange }: HeaderProps) {
  const periodMap: Record<string, TimePeriod> = {
    "7days": "DAYS_7",
    "30days": "DAYS_30",
    "90days": "DAYS_90",
    "1year": "YEAR_1",
  };

  const reversePeriodMap: Record<TimePeriod, string> = {
    DAYS_7: "7days",
    DAYS_30: "30days",
    DAYS_90: "90days",
    YEAR_1: "1year",
  };

  const handlePeriodChange = (value: string) => {
    const mappedPeriod = periodMap[value] || "DAYS_30";
    onPeriodChange(mappedPeriod);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 ease-in-out">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300">
        Analytics
      </h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto transition-all duration-300">
        <Select
          value={reversePeriodMap[period]}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] transition-all duration-300">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto transition-all duration-300"
        >
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>
    </div>
  );
}
