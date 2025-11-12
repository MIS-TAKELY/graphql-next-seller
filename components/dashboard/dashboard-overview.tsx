import {
  DASHBOARD_ACTIVE_CUSTOMER,
  DASHBOARD_PRODUCTS,
  GET_REVENUE,
  GET_SELLER_ORDER,
} from "@/client/dashboard/dashboard.query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export async function DashboardOverview() {
  const client = await getServerApolloClient();

  const { data: revenueData } = await client.query({ query: GET_REVENUE });
  const { data: activeUserData } = await client.query({
    query: DASHBOARD_ACTIVE_CUSTOMER,
  });
  const { data: orderData } = await client.query({ query: GET_SELLER_ORDER });
  const { data: productData } = await client.query({
    query: DASHBOARD_PRODUCTS,
  });

  console.log("revenueData-->", revenueData);
  console.log("orderData-->", orderData);
  console.log("productData-->", productData);
  console.log("activeUserData-->", activeUserData);

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
              +{activeUserData?.getActiveUsersForSeller?.percentChange } since last hour
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
