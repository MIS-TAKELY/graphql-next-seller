import { Category } from "../category.type";

// types/pages/product.ts
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "DISCONTINUED";

// export interface Category {
//   __typename?: string;
//   id: string;
//   name: string;
//   children?: Category[];
// }

export interface ProductImage {
  url: string;
  altText?: string;
  mediaType?: "PRIMARY" | "PROMOTIONAL";
  fileType?: "IMAGE" | "VIDEO";
  sortOrder?: number;
}

export interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  mrp?: number;
  attributes?: {
    weight?: number;
    height?: number;
    length?: number;
    width?: number;
    shippingClass?: string;
  };
  isDefault?: boolean;
  specifications?: Array<{
    key: string;
    value: string;
  }>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category | null;
  description?: string;
  brand?: string;
}

export interface InventoryVariant {
  id: string;
  sku: string;
  stock: number;
  soldCount: number;
  price?: number;
  mrp?: number;
}

export interface InventoryProduct {
  id: string;
  name: string;
  status: ProductStatus;
  variants: InventoryVariant[];
}

export interface GetMyProductsResponse {
  getMyProducts: {
    __typename?: string;
    products: Product[];
    percentChange?: number;
  };
}

export interface GetInventoryResponse {
  getMyProducts: {
    __typename?: string;
    products: InventoryProduct[];
  };
}

export interface GetProductCategoriesResponse {
  categories: Category[];
}

export type StatusFilter =
  | "all"
  | "active"
  | "draft"
  | "out_of_stock"
  | "low_stock";

export interface ICreateProductInput {
  id?: string;
  name: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  variants: ProductVariant;
  productOffers?: Array<{
    productId?: string;
    offer: {
      title: string;
      description?: string;
      type: "PERCENTAGE" | "FIXED_AMOUNT";
      value: number;
      startDate: string;
      endDate: string;
    };
  }>;
  deliveryOptions?: Array<{
    title: string;
    description?: string;
    isDefault: boolean;
  }>;
  warranty?: Array<{
    type: "SELLER" | "MANUFACTURER" | "NO_WARRANTY";
    duration: number;
    unit: string;
    description?: string;
  }>;
  returnPolicy?: Array<{
    type: "NO_RETURN" | "REPLACEMENT" | "REFUND" | "REPLACEMENT_OR_REFUND";
    duration: number;
    unit: string;
    conditions?: string;
  }>;
  images?: ProductImage[];
}

export interface Media {
  url: string;
  mediaType: "PRIMARY" | "PROMOTIONAL";
  publicId?: string;
  altText?: string;
  fileType?: "IMAGE" | "VIDEO";
  pending?: boolean;
  isLocal?: boolean;
  sortOrder?: number;
}

export interface FormData {
  // Basic Details
  name: string;
  description: string;
  categoryId: string;
  subcategory: string;
  subSubcategory?: string;
    category?: Category;
  brand: string;
  // Specifications
  features: string[];
  specifications: Array<{
    id?: string;
    key: string;
    value: string;
  }>;
  specificationDisplayFormat: "bullet" | "table";
  // Pricing & Inventory
  price: string;
  mrp: string;
  comparePrice: string;
  costPrice: string;
  sku: string;
  stock: string;
  trackQuantity: boolean;
  // Offers
  hasOffer: boolean;
  offerType: "PERCENTAGE" | "FIXED_AMOUNT";
  offerTitle: string;
  offerValue: string;
  offerStart: string;
  offerEnd: string;
  buyX: string;
  getY: string;
  // Media
  productMedia: Media[];
  promotionalMedia: Media[];
  // Shipping
  weight: string;
  length: string;
  width: string;
  height: string;
  isFragile: boolean;
  shippingMethod: string;
  carrier: string;
  estimatedDelivery: string;
  freeDeliveryOption: string;
  freeDeliveryProvinces: string[];
  noInternationalShipping: boolean;
  restrictedStates: string[];
  // Policies
  returnType: string;
  returnDuration: string;
  returnUnit: string;
  returnConditions: string;
  returnPolicy: string;
  returnPeriod: string;
  warrantyType: string;
  warrantyDuration: string;
  warrantyUnit: string;
  warrantyDescription: string;
  warrantyConditions: string;
  warranty: string;
}
export interface Step {
  id: number;
  title: string;
  description: string;
}


export interface Errors {
  [key: string]: string | undefined;
}
