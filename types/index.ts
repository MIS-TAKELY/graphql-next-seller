// types/index.ts
// Barrel export for all types

// Common types
export * from "./common/enums";
export * from "./common/primitives";

// Category types
export * from "./category/category.types";

// Product types - use explicit exports to avoid conflicts
export {
  type Product,
  type ProductVariant,
  type ProductSpecification,
  type ProductImage,
  type ProductOffer,
  type Offer,
  type DeliveryOption,
  type Warranty,
  type ReturnPolicy,
  type ProductAttribute,
} from "./product/product.types";
export * from "./product/product-form.types";
export {
  type ICreateProductVariantInput,
  type ICreateProductInput,
  type GetMyProductsResponse,
  type InventoryProduct,
  type GetInventoryResponse,
  type GetProductCategoriesResponse,
} from "./product/product-api.types";

// Order types - use explicit exports to avoid Product name conflict
export {
  type AddressSnapshot,
  type Buyer,
  type Payment,
  type Shipment,
  type ReturnPolicyType,
  type ReturnPolicy as OrderReturnPolicy,
  type ProductImage as OrderProductImage,
  type Product as OrderProduct,
  type ProductVariant as OrderProductVariant,
  type OrderItem,
  type Order,
  type SellerOrder,
  type OrderPriority,
  type OrderFilters,
} from "./order/order.types";
export * from "./order/order-api.types";

// Customer types
export * from "./customer/customer.types";
export * from "./customer/message-api.types";

// Analytics types
export * from "./analytics/analytics.types";

// GraphQL types
export * from "./graphql/graphql.types";

