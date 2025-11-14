// types/pages/product.ts

// Enums aligned with Prisma schema
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "DISCONTINUED";
export type MediaType = "PRIMARY" | "PROMOTIONAL";
export type FileType = "IMAGE" | "VIDEO";
export type DiscountType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "BUY_X_GET_Y"
  | "FREE_SHIPPING";
export type WarrantyType = "MANUFACTURER" | "SELLER" | "NO_WARRANTY";
export type ReturnType =
  | "NO_RETURN"
  | "REPLACEMENT"
  | "REFUND"
  | "REPLACEMENT_OR_REFUND";
export type ShippingMethod = "STANDARD" | "EXPRESS" | "OVERNIGHT" | "SAME_DAY";

// Category interface aligned with Prisma Category model
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  parent?: Category | null;
  children?: Category[];
}

// ProductImage interface aligned with Prisma ProductImage model
export interface ProductImage {
  id: string;
  variantId?: string; // Optional, as images can be tied to Product or ProductVariant
  productId: string;
  url: string;
  altText?: string;
  sortOrder?: number;
  mediaType: MediaType;
  fileType: FileType;
}

// ProductVariant interface aligned with Prisma ProductVariant model
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  price: number; // Decimal in Prisma, represented as number for simplicity
  mrp?: number; // Decimal in Prisma
  stock: number;
  soldCount: number;
  attributes?: {
    weight?: number;
    height?: number;
    length?: number;
    width?: number;
    [key: string]: any; // Flexible for additional JSON attributes
  };
  isDefault?: boolean;
  specifications?: Array<{
    id: string;
    key: string;
    value: string;
  }>;
}

// Product interface aligned with Prisma Product model
export interface Product {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  description?: string;
  status: ProductStatus;
  brand?: string;
  categoryId?: string;
  category?: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
  deliveryOptions?: Array<{
    id: string;
    title: string;
    description?: string;
    isDefault: boolean;
  }>;
  warranty?: Array<{
    id: string;
    type: WarrantyType;
    duration?: number;
    unit?: string;
    description?: string;
  }>;
  returnPolicy?: Array<{
    id: string;
    type: ReturnType;
    duration?: number;
    unit?: string;
    conditions?: string;
  }>;
  productOffers?: Array<{
    id: string;
    offerId: string;
    offer: {
      id: string;
      title: string;
      description?: string;
      type: DiscountType;
      value: number;
      startDate: string;
      endDate: string;
      isActive: boolean;
    };
  }>;
}

// InventoryVariant for inventory management
export interface InventoryVariant {
  id: string;
  sku: string;
  stock: number;
  soldCount: number;
  price?: number;
  mrp?: number;
}

// InventoryProduct for inventory management
export interface InventoryProduct {
  id: string;
  name: string;
  status: ProductStatus;
  variants: InventoryVariant[];
}

// API response types
export interface GetMyProductsResponse {
  getMyProducts: {
    products: Product[];
    percentChange?: number;
  };
}

export interface GetInventoryResponse {
  getMyProducts: {
    products: InventoryProduct[];
  };
}

export interface GetProductCategoriesResponse {
  categories: Category[];
}

// Status filter for product listing
export type StatusFilter =
  | "all"
  | "active"
  | "draft"
  | "out_of_stock"
  | "low_stock";

// Input for creating/updating a product
export interface ICreateProductInput {
  id?: string;
  name: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  variants: Array<{
    sku: string;
    price: number;
    mrp?: number;
    stock: number;
    soldCount?: number;
    attributes?: {
      weight?: number;
      height?: number;
      length?: number;
      width?: number;
      [key: string]: any;
    };
    isDefault?: boolean;
    specifications?: Array<{
      key: string;
      value: string;
    }>;
  }>;
  images?: Array<{
    url: string;
    altText?: string;
    sortOrder?: number;
    mediaType: MediaType;
    fileType: FileType;
  }>;
  productOffers?: Array<{
    offer: {
      title: string;
      description?: string;
      type: DiscountType;
      value: number;
      startDate: string;
      endDate: string;
      isActive?: boolean;
    };
  }>;
  deliveryOptions?: Array<{
    title: string;
    description?: string;
    isDefault: boolean;
  }>;
  warranty?: Array<{
    type: WarrantyType;
    duration?: number;
    unit?: string;
    description?: string;
  }>;
  returnPolicy?: Array<{
    type: ReturnType;
    duration?: number;
    unit?: string;
    conditions?: string;
  }>;
}

// Media interface for form handling
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

// FormData for product creation form
export interface FormData {
  // Basic Details
  name: string;
  description: string;
  categoryId: string;
  brand: string;
  // Specifications
  specifications: Array<{
    id?: string;
    key: string;
    value: string;
  }>;
  specificationDisplayFormat: "bullet" | "table";
  // Pricing & Inventory
  price: string;
  mrp: string;
  sku: string;
  stock: string;
  trackQuantity: boolean;
  // Offers
  hasOffer: boolean;
  offerType: DiscountType;
  offerTitle: string;
  offerValue: string;
  offerStart: string;
  offerEnd: string;
  // Media
  productMedia: Media[];
  promotionalMedia: Media[];
  // Shipping
  weight: string;
  length: string;
  width: string;
  height: string;
  shippingMethod: ShippingMethod;
  carrier: string;
  estimatedDelivery: string;
  // Policies
  returnType: ReturnType;
  returnDuration: string;
  returnUnit: string;
  returnConditions: string;
  warrantyType: WarrantyType;
  warrantyDuration: string;
  warrantyUnit: string;
  warrantyDescription: string;
}

// Step interface for multi-step form
export interface Step {
  id: number;
  title: string;
  description: string;
}

// Errors interface for form validation
export interface Errors {
  [key: string]: string | undefined;
}
