import {
  DASHBOARD_ACTIVE_CUSTOMER,
  DASHBOARD_PRODUCTS,
  GET_REVENUE,
  GET_SELLER_ORDER_FOR_DASHBOARD,
} from "@/client/dashboard/dashboard.query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { getCachedData, setCachedData } from "@/lib/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DashboardOverview() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;
  const cacheKey = `dashboard_overview_${userId}`;

  // Try to get cached data first
  const cachedData = await getCachedData<any>(cacheKey);

  let revenueData, activeUserData, orderData, productData;

  if (cachedData) {
    ({ revenueData, activeUserData, orderData, productData } = cachedData);
  } else {
    const client = await getServerApolloClient();

    // Fetch all data in parallel
    const [revRes, activeRes, orderRes, prodRes] = await Promise.all([
      client.query({ query: GET_REVENUE }),
      client.query({ query: DASHBOARD_ACTIVE_CUSTOMER }),
      client.query({ query: GET_SELLER_ORDER_FOR_DASHBOARD }),
      client.query({ query: DASHBOARD_PRODUCTS }),
    ]);

    revenueData = revRes.data;
    activeUserData = activeRes.data;
    orderData = orderRes.data;
    productData = prodRes.data;

    // Cache the fetched data for 5 minutes
    await setCachedData(cacheKey, {
      revenueData,
      activeUserData,
      orderData,
      productData
    }, 300);
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Total Revenue
          </CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        {revenueData && (
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {revenueData?.getTotalRevenue?.currentRevenue}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueData?.getTotalRevenue?.percentChange}% from last month
            </p>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Orders
          </CardTitle>
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        {orderData && (
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {orderData?.getSellerOrders?.currentOrderCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {orderData?.getSellerOrders?.percentChange}% from last month
            </p>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Products
          </CardTitle>
          <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        {productData && (
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {productData?.getMyProducts?.products.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {productData?.getMyProducts?.percentChange}% from last month
            </p>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Active Customers
          </CardTitle>
          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        {activeUserData && (
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{activeUserData?.getActiveUsersForSeller?.currentActiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{activeUserData?.getActiveUsersForSeller?.percentChange} since last hour
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
