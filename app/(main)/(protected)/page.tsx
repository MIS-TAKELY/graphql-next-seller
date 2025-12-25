import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SalesChart = nextDynamic(() => import("@/components/dashboard/SalesChart").then(mod => mod.SalesChart), {
  loading: () => <div className="h-[350px] w-full animate-pulse bg-muted/50 rounded-lg" />
});

import Container from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <Container className="flex-1 space-y-3 sm:space-y-4 py-4 sm:py-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-3 sm:space-y-4">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardOverview />
            <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-2">
                  <SalesChart />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentOrders />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    Top Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopProducts />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage your store efficiently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuickActions />
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-3 sm:space-y-4">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardOverview />
            <SalesChart />
          </Suspense>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
