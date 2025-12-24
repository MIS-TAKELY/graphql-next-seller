// "use client";

import { GET_SELLER_ORDER } from "@/client/order/order.query";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { OrdersAllPage } from "./OrdersAllPage";
import { OrdersSkeleton } from "./OrdersSkeleton";

// Recursively remove __typename from GraphQL responses
function stripTypename(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(stripTypename);
  }

  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key !== '__typename') {
        newObj[key] = stripTypename(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
}

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

  // Strip __typename and serialize Decimal fields to numbers for Client Component
  const cleanedOrders = stripTypename(orders);

  const serializedOrders = cleanedOrders.map((order: any) => ({
    ...order,
    subtotal: order.subtotal ? Number(order.subtotal) : 0,
    tax: order.tax ? Number(order.tax) : 0,
    shippingFee: order.shippingFee ? Number(order.shippingFee) : 0,
    commission: order.commission ? Number(order.commission) : 0,
    total: order.total ? Number(order.total) : 0,
    items: order.items?.map((item: any) => ({
      ...item,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : 0,
      totalPrice: item.totalPrice ? Number(item.totalPrice) : 0,
      commission: item.commission ? Number(item.commission) : 0,
      variant: item.variant ? {
        ...item.variant,
        price: item.variant.price ? Number(item.variant.price) : 0,
        mrp: item.variant.mrp ? Number(item.variant.mrp) : 0,
      } : null,
    })) || [],
    order: order.order ? {
      ...order.order,
      subtotal: order.order.subtotal ? Number(order.order.subtotal) : 0,
      tax: order.order.tax ? Number(order.order.tax) : 0,
      shippingFee: order.order.shippingFee ? Number(order.order.shippingFee) : 0,
      discount: order.order.discount ? Number(order.order.discount) : 0,
      total: order.order.total ? Number(order.order.total) : 0,
      payments: order.order.payments?.map((payment: any) => ({
        ...payment,
        amount: payment.amount ? Number(payment.amount) : 0,
      })) || [],
    } : null,
  }));

  return <OrdersAllPage orders={serializedOrders} />;
}
