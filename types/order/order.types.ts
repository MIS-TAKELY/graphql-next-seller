// types/order/order.types.ts
// Order domain types

import type {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  ShippingMethod,
  DisputeStatus,
  DisputeType,
} from "../common/enums";
export interface OrderDispute extends BaseEntity {
  orderId: string;
  sellerOrderId?: string;
  userId: string;
  reason: string;
  description?: string;
  images?: string[];
  status: DisputeStatus;
  type: DisputeType;
  user?: Buyer;
  order?: Order;
}

export interface GetSellerDisputesResponse {
  getSellerDisputes: OrderDispute[];
}
import type { BaseEntity, Money, Timestamps } from "../common/primitives";

// Address snapshot types (stored as JSON in DB)
export interface AddressSnapshot {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  label?: string;
}

// User/Buyer types
export interface Buyer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Payment types
export interface Payment extends BaseEntity {
  orderId: string;
  methodId?: string;
  amount: Money;
  currency: string;
  status: PaymentStatus;
  transactionId?: string;
  provider: string;
  esewaRefId?: string;
  productCode?: string;
  signature?: string;
  verifiedAt?: Date | string;
}

// Shipment types
export interface Shipment extends BaseEntity {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  method?: ShippingMethod;
  status: ShipmentStatus;
  shippedAt?: string | Date;
  deliveredAt?: string | Date;
  estimatedDelivery?: string | Date;
}

// Product types (minimal for order context)
export type ReturnPolicyType = "NO_RETURN" | "DAYS_30" | "DAYS_60" | "DAYS_90";

export interface ReturnPolicy {
  type: ReturnPolicyType;
}

export interface ProductImage {
  url: string;
  altText?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  images: ProductImage[];
  returnPolicy?: ReturnPolicy;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: Money;
  mrp?: Money;
  product: Product;
  attributes?: Record<string, any>;
}

// Order item types
export interface OrderItem extends BaseEntity {
  orderId: string;
  variantId: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  variant: ProductVariant;
  commission?: Money;
}

// Main Order type
export interface Order extends BaseEntity {
  orderNumber: string;
  buyerId: string;
  status: OrderStatus;
  shippingSnapshot: AddressSnapshot | string; // Can be JSON string or parsed object
  billingSnapshot?: AddressSnapshot | string;
  subtotal: Money;
  tax: Money;
  shippingFee: Money;
  discount: Money;
  total: Money;
  offerId?: string;
  buyer?: Buyer;
  payments?: Payment[];
  shipments?: Shipment[];
  items?: OrderItem[];
}

// Seller Order type
export interface SellerOrder extends BaseEntity {
  sellerId: string;
  buyerOrderId: string;
  status: OrderStatus;
  subtotal: Money;
  tax: Money;
  shippingFee: Money;
  commission: Money;
  total: Money;
  order: Order;
  items: OrderItem[];
  priority?: OrderPriority;
}

export type OrderPriority = "high" | "normal" | "low";

export interface OrderFilters {
  search: string;
  status: OrderStatus | "all";
  priority: OrderPriority | "all";
}

// API Response Types
export interface GetSellerOrdersResponse {
  getSellerOrders: {
    sellerOrders: SellerOrder[];
  };
}

