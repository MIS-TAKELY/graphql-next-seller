import { GET_SELLER_ORDER } from "@/client/order/order.query";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GetSellerOrdersResponse, OrderStatus } from "@/types/pages/order.types";
import OrderStatusPage from "@/components/orders/OrderStatusPage";
import { notFound, redirect } from "next/navigation";

interface StatusPageProps {
  params: Promise<{ status: string }> | { status: string }; // Handle both promise and object
}

export default async function StatusPage({ params }: StatusPageProps) {
  const client = await getServerApolloClient();
  const { data } = await client.query<GetSellerOrdersResponse>({
    query: GET_SELLER_ORDER,
  });

  const orders = data?.getSellerOrders?.sellerOrders || [];

  const statusMap: Record<
    string,
    { status: OrderStatus | "all"; tabValue: "all" | "new" | "processing" | "shipped" | "delivered" | "returns" }
  > = {
    all: { status: "all", tabValue: "all" },
    new: { status: "PENDING", tabValue: "new" },
    processing: { status: "PROCESSING", tabValue: "processing" },
    shipped: { status: "SHIPPED", tabValue: "shipped" },
    delivered: { status: "DELIVERED", tabValue: "delivered" },
    returns: { status: "RETURNED", tabValue: "returns" },
  };

  // Resolve params if it's a promise
  let resolvedParams: { status: string };
  if (params instanceof Promise) {
    console.log("params is a Promise, awaiting resolution");
    resolvedParams = await params;
  } else {
    resolvedParams = params;
  }

  const status = resolvedParams.status?.toLowerCase();
  console.log("resolvedParams-->", resolvedParams);
  console.log("params.status-->", status);

  // Redirect to default page if status is undefined
  if (!status) {
    console.log("No status provided, redirecting to /orders/all");
    redirect("/orders/all");
  }

  const config = statusMap[status];
  console.log("config-->", config);

  if (!config) {
    console.log("Invalid status, triggering notFound");
    notFound();
  }

  return (
    <OrderStatusPage
      orders={orders}
      status={config.status}
      tabValue={config.tabValue}
    />
  );
}