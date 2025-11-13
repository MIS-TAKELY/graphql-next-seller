// pages/orders/index.tsx
import { GET_SELLER_ORDER } from "@/client/order/order.query";
import { OrdersAllPage } from "@/components/orders/OrdersAllPage";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GetSellerOrdersResponse } from "@/types/pages/order.types";

export default async function OrdersPage() {
  const client = await getServerApolloClient();
  const { data } = await client.query<GetSellerOrdersResponse>({
    query: GET_SELLER_ORDER,
  });

  return <OrdersAllPage orders={data?.getSellerOrders?.sellerOrders || []} />;
}