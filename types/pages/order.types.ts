// types/order.types.ts
export interface Buyer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Payment {
  id: string;
  provider: string;
  status: string;
  amount: number;
  transactionId?: string;
}

export interface Shipment {
  id: string;
  trackingNumber?: string;
  carrier?: string;
  status: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
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
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  mrp?: number;
  product: Product;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  commission: number;
  variant: ProductVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  shippingSnapshot?: any;
  billingSnapshot?: any;
  buyer: Buyer;
  payments: Payment[];
  shipments: Shipment[];
}

export interface SellerOrder {
  id: string;
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
  priority?: OrderPriority; // Add priority
}

export interface GetSellerOrdersResponse {
  getSellerOrders: {
    sellerOrders: SellerOrder[];
  };
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type OrderPriority = "high" | "normal" | "low";

export interface OrderFilters {
  search: string;
  status: OrderStatus | "all";
  priority: OrderPriority | "all";
}
