// types/product/product-form.types.ts
// Product form state and UI types

import type {
  ProductStatus,
  MediaType,
  FileType,
  DiscountType,
  WarrantyType,
  ReturnType,
  ShippingMethod,
} from "../common/enums";
import type { Category } from "../category/category.types";
import type { ProductAttribute } from "./product.types";

// Media interface for form
export interface Media {
  url: string;
  mediaType: MediaType;
  publicId?: string;
  altText?: string;
  fileType?: FileType;
  pending?: boolean;
  isLocal?: boolean;
  sortOrder?: number;
}

// Variant Data used in the Form State
export interface ProductVariantData {
  id?: string;
  sku: string;
  price: string;
  mrp: string;
  stock: string | number;
  attributes: Record<string, string>;
  isDefault: boolean;
  specifications?: Array<{ key: string; value: string }>;
  specificationTable?: {
    headers: string[];
    rows: string[][];
  };
}

export interface DeliveryOptionData {
  title: string;
  description?: string;
  isDefault: boolean;
}

// Form Data State
export interface FormData {
  // Basic
  name: string;
  description: string;
  categoryId: string;
  subcategory: string;
  subSubcategory: string;
  category?: Category;
  brand: string;
  status: ProductStatus;

  // Variants & Inventory
  hasVariants: boolean;

  // Simple Product Fields
  price: string;
  mrp: string;
  comparePrice?: string;
  costPrice?: string;
  sku: string;
  stock: string | number;
  trackQuantity?: boolean;

  // Variable Product Fields
  attributes: ProductAttribute[];
  variants: ProductVariantData[];

  // Global Specs
  features?: string[];
  specifications: Array<{
    id?: string;
    key: string;
    value: string;
  }>;
  specificationTable?: {
    headers: string[];
    rows: string[][];
  };
  specificationDisplayFormat: "bullet" | "table" | "custom_table";

  // Offers
  hasOffer: boolean;
  offerType: DiscountType;
  offerTitle: string;
  offerValue: string;
  offerStart: string;
  offerEnd: string;
  buyX?: string;
  getY?: string;

  // Media
  productMedia: Media[];
  promotionalMedia: Media[];

  // Shipping
  weight: string | number;
  length: string;
  width: string;
  height: string;
  isFragile: boolean;
  shippingMethod?: ShippingMethod;
  carrier?: string;
  estimatedDelivery?: string;
  freeDeliveryOption?: string;
  freeDeliveryProvinces?: string[];
  noInternationalShipping?: boolean;
  restrictedStates?: string[];
  deliveryOptions: DeliveryOptionData[];

  // Policies
  returnType: ReturnType;
  returnDuration: string;
  returnUnit: string;
  returnConditions: string;
  returnPolicy?: string;
  returnPeriod?: string;

  warrantyType: WarrantyType;
  warrantyDuration: string;
  warrantyUnit: string;
  warrantyDescription: string;
  warranty?: string;
  warrantyConditions?: string;
}

// Step interface
export interface Step {
  id: number;
  title: string;
  description: string;
}

// Errors interface
export interface Errors {
  [key: string]: string | undefined;
}

// Status filter type (includes UI filter values)
export type StatusFilter = ProductStatus | "all" | "active" | "draft" | "out_of_stock" | "low_stock";

