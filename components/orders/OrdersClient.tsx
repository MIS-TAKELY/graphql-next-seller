// "use client";

import { GET_SELLER_ORDER } from "@/client/order/order.query";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { OrdersAllPage } from "./OrdersAllPage";
import { OrdersSkeleton } from "./OrdersSkeleton";

export default async function OrdersClient() {
  const client = await getServerApolloClient();

  const { data, loading, error } = await client.query({
    query: GET_SELLER_ORDER,
    fetchPolicy: "no-cache",
  });




  if (loading && !data) {
    return <OrdersSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading orders</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const orders = data?.getSellerOrders?.sellerOrders || [];

  console.log("orders-->", orders)

  return <OrdersAllPage orders={orders} />;
}
