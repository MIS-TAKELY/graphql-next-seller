"use client";

import { GET_SELLER_ORDER } from "@/client/order/order.query";
import { useQuery } from "@apollo/client";
import { OrdersAllPage } from "./OrdersAllPage";

export default function OrdersClient() {
  const { data, loading, error, refetch } = useQuery(GET_SELLER_ORDER, {
    fetchPolicy: "cache-and-network",
    pollInterval: 30000, // Poll every 30 seconds for new orders
  });

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

  return <OrdersAllPage orders={orders} onRefetch={refetch} />;
}

