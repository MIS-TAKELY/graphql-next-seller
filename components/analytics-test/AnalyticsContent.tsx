"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomersTab } from "./tabs/CustomersTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { ProductsTab } from "./tabs/ProductsTab";
import { SalesTab } from "./tabs/SalesTab";

interface AnalyticsContentProps {
  initialData: {
    salesData: any[];
    productData: any[];
  };
}

export function AnalyticsContent({ initialData }: AnalyticsContentProps) {
  const { salesData, productData } = initialData;

  return (
    <Tabs defaultValue="overview" className="space-y-4 w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">
          Overview
        </TabsTrigger>
        <TabsTrigger value="sales" className="text-xs sm:text-sm">
          Sales
        </TabsTrigger>
        <TabsTrigger value="products" className="text-xs sm:text-sm">
          Products
        </TabsTrigger>
        <TabsTrigger value="customers" className="text-xs sm:text-sm">
          Customers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <OverviewTab salesData={salesData} productData={productData} />
      </TabsContent>

      <TabsContent value="sales" className="space-y-4 mt-4">
        <SalesTab salesData={salesData} />
      </TabsContent>

      <TabsContent value="products" className="space-y-4 mt-4">
        <ProductsTab salesData={salesData} productData={productData} />
      </TabsContent>

      <TabsContent value="customers" className="space-y-4 mt-4">
        <CustomersTab salesData={salesData} />
      </TabsContent>
    </Tabs>
  );
}