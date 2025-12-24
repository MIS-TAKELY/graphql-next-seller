// types/common/enums.ts
// Common enums used across the application

export enum Role {
  BUYER = "BUYER",
  SELLER = "SELLER",
  ADMIN = "ADMIN",
}

export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING",
  BUSINESS = "BUSINESS",
  WAREHOUSE = "WAREHOUSE",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  SYSTEM = "SYSTEM",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum PaymentMethodType {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  UPI = "UPI",
  NET_BANKING = "NET_BANKING",
  WALLET = "WALLET",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum ProductStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DISCONTINUED = "DISCONTINUED",
}

export enum ShipmentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  IN_TRANSIT = "IN_TRANSIT",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  RETURNED = "RETURNED",
  LOST = "LOST",
}

export enum ShippingMethod {
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS",
  OVERNIGHT = "OVERNIGHT",
  SAME_DAY = "SAME_DAY",
}

export enum MediaType {
  PRIMARY = "PRIMARY",
  PROMOTIONAL = "PROMOTIONAL",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  BUY_X_GET_Y = "BUY_X_GET_Y",
  FREE_SHIPPING = "FREE_SHIPPING",
}

export enum DiscountScope {
  PRODUCT = "PRODUCT",
  CATEGORY = "CATEGORY",
  CART = "CART",
  SHIPPING = "SHIPPING",
  USER_SPECIFIC = "USER_SPECIFIC",
}

export enum CouponStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
  USED_UP = "USED_UP",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHERS = "OTHERS",
  NOT_TO_SAY = "NOT_TO_SAY",
}

export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum FileType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
}

export enum WarrantyType {
  MANUFACTURER = "MANUFACTURER",
  SELLER = "SELLER",
  NO_WARRANTY = "NO_WARRANTY",
}

export enum ReturnType {
  NO_RETURN = "NO_RETURN",
  REPLACEMENT = "REPLACEMENT",
  REFUND = "REFUND",
  REPLACEMENT_OR_REFUND = "REPLACEMENT_OR_REFUND",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum DisputeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RESOLVED = "RESOLVED",
}

export enum DisputeType {
  CANCEL = "CANCEL",
  RETURN = "RETURN",
}

// Type aliases for backward compatibility
export type RoleType = Role;
export type MessageTypeType = MessageType;
export type OrderStatusType = OrderStatus;
export type ProductStatusType = ProductStatus;
export type ShippingMethodType = ShippingMethod;
export type MediaTypeType = MediaType;
export type DiscountTypeType = DiscountType;
export type FileTypeType = FileType;
export type WarrantyTypeType = WarrantyType;
export type ReturnTypeType = ReturnType;

