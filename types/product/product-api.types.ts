// types/product/product-api.types.ts
// Product API input/output types

import type {
  ProductStatus,
  MediaType,
  FileType,
  DiscountType,
  WarrantyType,
  ReturnType,
} from "../common/enums";
import type { Money } from "../common/primitives";
import type { Product } from "./product.types";

// API Input Types
export interface ICreateProductVariantInput {
  id?: string;
  sku: string;
  price: number;
  mrp?: number;
  stock: number;
  attributes?: Record<string, any>;
  isDefault?: boolean;
  specifications?: Array<{ key: string; value: string }>;
  specificationTable?: any;
}

export interface ICreateProductInput {
  id?: string;
  name: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  status?: ProductStatus;
  variants: ICreateProductVariantInput[];
  specificationTable?: any;
  images: Array<{
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
    isDefault?: boolean;
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

// API Response Types
export interface GetMyProductsResponse {
  getMyProducts: {
    products: Product[];
    totalCount: number;
    percentChange?: number;
  };
}

export interface GetMyProductStatsResponse {
  getMyProductStats: {
    total: number;
    active: number;
    outOfStock: number;
    lowStock: number;
  };
}

// Product type is exported from product.types.ts, no need to re-export here

// Inventory types
export interface InventoryProduct {
  id: string;
  name: string;
  slug: string;
  variants: Array<{
    id: string;
    sku: string;
    stock: number;
    soldCount?: number;
    price: Money;
    mrp?: Money;
  }>;
}

export interface GetInventoryResponse {
  getInventory: {
    products: InventoryProduct[];
  };
}

// Categories response type
import type { Category } from "../category/category.types";

export interface GetProductCategoriesResponse {
  categories: Category[];
}

