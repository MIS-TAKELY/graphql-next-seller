// types/order.types.ts

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
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  provider: string;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
}

// Shipment types
export type ShipmentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "LOST";

export type ShippingMethod = "STANDARD" | "EXPRESS" | "OVERNIGHT" | "SAME_DAY";

export interface Shipment {
  id: string;
  trackingNumber?: string;
  carrier?: string;
  method?: ShippingMethod;
  status: ShipmentStatus;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
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
  price: number;
  mrp?: number;
  product: Product;
}

// Order item types
export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  commission: number;
  variant: ProductVariant;
}

// Order status
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

// Main Order type
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  shippingSnapshot: AddressSnapshot;
  billingSnapshot?: AddressSnapshot;
  buyer: Buyer;
  payments: Payment[];
  shipments: Shipment[];
}

// Seller Order type
export interface SellerOrder {
  id: string;
  buyerOrderId: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shippingFee: number;
  commission: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  order: Order;
  items: OrderItem[];
  priority?: OrderPriority;
}

export interface GetSellerOrdersResponse {
  getSellerOrders: {
    sellerOrders: SellerOrder[];
  };
}

export type OrderPriority = "high" | "normal" | "low";

export interface OrderFilters {
  search: string;
  status: OrderStatus | "all";
  priority: OrderPriority | "all";
}
