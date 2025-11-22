// types/order/order-api.types.ts
// Order API input/output types

import type { OrderStatus, ShippingMethod } from "../common/enums";

export interface ConfirmOrderInput {
  sellerOrderId: string;
}

export interface UpdateSellerOrderStatusInput {
  sellerOrderId: string;
  status: OrderStatus;
}

export interface CreateShipmentInput {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status?: string;
  method?: ShippingMethod;
}

