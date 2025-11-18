// "use client";

import { GET_SELLER_ORDER } from "@/client/order/order.query";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { OrdersAllPage } from "./OrdersAllPage";

export default async function OrdersClient() {
  const client =await getServerApolloClient();

  const {data,loading,error} = await client.query({
    query: GET_SELLER_ORDER,
    fetchPolicy: "no-cache",
  });

  // console.log("data-->",data)
  // console.log("loading-->",loading)

  

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
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

  return <OrdersAllPage orders={orders} />;
}
