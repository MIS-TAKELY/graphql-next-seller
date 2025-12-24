// types/pages/order.types.ts
// Backward compatibility re-exports from new modular structure

// Re-export enums as both types and values
export {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  ShippingMethod,
  DisputeStatus,
  DisputeType,
} from "../common/enums";

export type {
  OrderStatus as OrderStatusType,
  PaymentStatus as PaymentStatusType,
  ShipmentStatus as ShipmentStatusType,
  ShippingMethod as ShippingMethodType,
} from "../common/enums";

export type {
  AddressSnapshot,
  Buyer,
  Payment,
  Shipment,
  ReturnPolicyType,
  ReturnPolicy,
  ProductImage,
  Product,
  ProductVariant,
  OrderItem,
  Order,
  SellerOrder,
  OrderDispute,
  OrderPriority,
  OrderFilters,
  GetSellerOrdersResponse,
} from "../order/order.types";
