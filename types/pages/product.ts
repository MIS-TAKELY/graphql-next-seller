// types/pages/product.ts
// Backward compatibility re-exports from new modular structure

// Re-export enums as types for backward compatibility
export type {
  ProductStatus,
  MediaType,
  FileType,
  DiscountType,
  WarrantyType,
  ReturnType,
  ShippingMethod,
} from "../common/enums";

// Re-export interfaces
export type { Category } from "../category/category.types";
export type { ProductAttribute } from "../product/product.types";
export type {
  ProductVariantData,
  DeliveryOptionData,
  FormData,
  Media,
  Step,
  Errors,
  StatusFilter,
} from "../product/product-form.types";
export type {
  ICreateProductVariantInput,
  ICreateProductInput,
  GetMyProductsResponse,
  InventoryProduct,
  GetInventoryResponse,
  GetProductCategoriesResponse,
} from "../product/product-api.types";
// Re-export Product for backward compatibility
export type { Product } from "../product/product.types";