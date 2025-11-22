// types/product/product.types.ts
// Core product domain types

import type {
  ProductStatus,
  MediaType,
  FileType,
  DiscountType,
  WarrantyType,
  ReturnType,
  ShippingMethod,
} from "../common/enums";
import type { BaseEntity, Money, Timestamps } from "../common/primitives";
import type { Category } from "../category/category.types";

// Product Variant
export interface ProductVariant extends BaseEntity {
  productId: string;
  sku: string;
  price: Money;
  mrp?: Money;
  comparePrice?: Money;
  costPrice?: Money;
  stock: number;
  soldCount?: number;
  attributes?: Record<string, any>;
  isDefault: boolean;
  specifications?: ProductSpecification[];
}

export interface ProductSpecification extends BaseEntity {
  variantId: string;
  key: string;
  value: string;
}

// Product Image
export interface ProductImage extends BaseEntity {
  productId: string;
  variantId?: string | null;
  url: string;
  altText?: string;
  sortOrder: number;
  mediaType: MediaType;
  fileType: FileType;
}

// Product Offer
export interface Offer extends BaseEntity {
  title: string;
  description?: string;
  type: DiscountType;
  value: Money;
  bannerImage?: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  buyX?: number;
  getY?: number;
}

export interface ProductOffer extends BaseEntity {
  offerId: string;
  productId: string;
  offer: Offer;
}

// Delivery Option
export interface DeliveryOption extends BaseEntity {
  productId: string;
  title: string;
  description?: string;
  isDefault: boolean;
  carrier?: string;
  estimatedDelivery?: string;
  freeDeliveryProvinces?: string[];
}

// Warranty
export interface Warranty extends BaseEntity {
  productId: string;
  type: WarrantyType;
  duration?: number;
  unit?: string;
  description?: string;
}

// Return Policy
export interface ReturnPolicy extends BaseEntity {
  productId: string;
  type: ReturnType;
  duration?: number;
  unit?: string;
  conditions?: string;
}

// Main Product Type
export interface Product extends BaseEntity {
  sellerId: string;
  name: string;
  slug: string;
  description?: string;
  status: ProductStatus;
  categoryId?: string;
  brand: string;
  category?: Category | null;
  variants: ProductVariant[];
  images: ProductImage[];
  productOffers?: ProductOffer[];
  deliveryOptions?: DeliveryOption[];
  warranty?: Warranty[];
  returnPolicy?: ReturnPolicy[];
  features?: string[];
  isFragile?: boolean;
  noInternationalShipping?: boolean;
  restrictedStates?: string[];
}

// Product Attribute (for variant generation)
export interface ProductAttribute {
  name: string;
  values: string[];
}

