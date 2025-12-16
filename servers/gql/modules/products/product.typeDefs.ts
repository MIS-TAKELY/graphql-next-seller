import { gql } from "graphql-tag";

export const productTypeDefs = gql`
  scalar JSON
  scalar DateTime

  # --- ENUMS ---
  enum ProductStatus {
    DRAFT
    ACTIVE
    INACTIVE
    DISCONTINUED
  }

  enum DiscountType {
    PERCENTAGE
    FIXED_AMOUNT
    BUY_X_GET_Y
    FREE_SHIPPING
  }

  enum WarrantyType {
    MANUFACTURER
    SELLER
    NO_WARRANTY
  }

  enum ReturnType {
    NO_RETURN
    REPLACEMENT
    REFUND
    REPLACEMENT_OR_REFUND
  }

  enum FileType {
    IMAGE
    VIDEO
  }

  enum MediaType {
    PRIMARY
    PROMOTIONAL
  }

  # --- TYPES ---

  type ProductSpecification {
    id: ID!
    key: String!
    value: String!
  }

  #type ProductVariant {
  #  id: ID!
  #  sku: String!
  #  price: Float!
  #  mrp: Float!
  #  stock: Int!
  #  attributes: JSON
  #  isDefault: Boolean
  #  specifications: [ProductSpecification!]
  #}

  type ProductImage {
    id: ID!
    url: String!
    altText: String
    mediaType: MediaType
    fileType: FileType
    sortOrder: Int
  }

  type DeliveryOption {
    id: ID!
    title: String!
    description: String
    isDefault: Boolean
  }

  type Warranty {
    type: WarrantyType!
    duration: Int
    unit: String
    description: String
  }

  type ReturnPolicy {
    type: ReturnType!
    duration: Int
    unit: String
    conditions: String
  }

  type Product {
    id: ID!
    sellerId: String!
    name: String!
    slug: String!
    categoryId: String
    description: String
    status: ProductStatus!
    brand: String

    variants: [ProductVariant!]!
    images: [ProductImage!]
    category: Category
    deliveryOptions: [DeliveryOption!]
    warranty: [Warranty!]
    returnPolicy: [ReturnPolicy!]
    productOffers:[ProductOffer]

    createdAt: String!
    updatedAt: String!
  }

  # --- INPUTS ---

  input SpecificationInput {
    key: String!
    value: String!
  }



  input CreateProductImageInput {
    url: String!
    altText: String
    sortOrder: Int
    mediaType: MediaType
    fileType: FileType!
  }

  input CreateDeliveryOptionInput {
    title: String!
    description: String
    isDefault: Boolean
  }

  input CreateWarrantyInput {
    type: WarrantyType!
    duration: Int
    unit: String
    description: String
  }

  input CreateReturnPolicyInput {
    type: ReturnType!
    duration: Int
    unit: String
    conditions: String
  }

  #input CreateProductOfferInput {
  #  offer: OfferInput!
  #}
#
  #input OfferInput {
  #  title: String!
  #  description: String
  #  type: DiscountType!
  #  value: Float!
  #  startDate: String!
  #  endDate: String!
  #  isActive: Boolean
  #}

  # --- MAIN INPUTS ---

  input CreateProductInput {
    name: String!
    description: String
    categoryId: String
    brand: String
    status: ProductStatus

    # 👇 FIXED HERE: Added [] brackets to indicate an Array
    variants: [CreateProductVariantInput!]!

    images: [CreateProductImageInput!]!
    deliveryOptions: [CreateDeliveryOptionInput!]
    warranty: [CreateWarrantyInput!]
    returnPolicy: [CreateReturnPolicyInput!]
    productOffers: [CreateProductOfferInput!]
  }

  input UpdateProductInput {
    id: ID!
    name: String
    description: String
    categoryId: String
    brand: String
    status: ProductStatus

    # 👇 FIXED HERE: Added [] brackets to indicate an Array
    variants: [UpdateProductVariantInput!]!

    images: [CreateProductImageInput!]
    deliveryOptions: [CreateDeliveryOptionInput!]
    warranty: [CreateWarrantyInput!]
    returnPolicy: [CreateReturnPolicyInput!]
    productOffers: [CreateProductOfferInput!]
  }

  type getMyProductsResponse {
    products: [Product]
    currentMonthCount: Float
    previousMonthCount: Float
    percentChange: Float
  }

  type Query {
    getProducts: [Product!]!
    getProduct(productId: ID!): Product!
    getProductBySlug(slug: String!): Product
    getMyProducts: getMyProductsResponse
  }

  type Mutation {
    addProduct(input: CreateProductInput!): Boolean
    updateProduct(input: UpdateProductInput!): Boolean
    deleteProduct(productId: ID!): Boolean
  }
`;
