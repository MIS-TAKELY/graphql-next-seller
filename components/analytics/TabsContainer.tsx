// components/analytics/TabsContainer.tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomersTab from "./CustomersTab";
import OverviewTab from "./OverviewTab";
import ProductsTab from "./ProductsTab";
import SalesTab from "./SalesTab";

type TimePeriod = "DAYS_7" | "DAYS_30" | "DAYS_90" | "YEAR_1";

type TabsContainerProps = {
  period: TimePeriod;
  chartConfig: any;
};

export default function TabsContainer({
  period,
  chartConfig,
}: TabsContainerProps) {
  return (
    <Tabs
      defaultValue="overview"
      className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out"
    >
      <TabsList className="grid grid-cols-4 w-full gap-1 sm:gap-2 transition-all duration-300">
        <TabsTrigger
          value="overview"
          className="text-xs sm:text-sm transition-all duration-300"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="sales"
          className="text-xs sm:text-sm transition-all duration-300"
        >
          Sales
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className="text-xs sm:text-sm transition-all duration-300"
        >
          Products
        </TabsTrigger>
        <TabsTrigger
          value="customers"
          className="text-xs sm:text-sm transition-all duration-300"
        >
          Customers
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="overview"
        className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out"
      >
        <OverviewTab period={period} chartConfig={chartConfig} />
      </TabsContent>
      <TabsContent
        value="sales"
        className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out"
      >
        <SalesTab period={period} chartConfig={chartConfig} />
      </TabsContent>
      <TabsContent
        value="products"
        className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out"
      >
        <ProductsTab period={period} chartConfig={chartConfig} />
      </TabsContent>
      <TabsContent
        value="customers"
        className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out"
      >
        <CustomersTab period={period} chartConfig={chartConfig} />
      </TabsContent>
    </Tabs>
  );
}
