import { gql } from "graphql-tag";

export const productTypeDefs = gql`
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

  scalar DateTime

  type Product {
    id: ID!
    sellerId: String!
    name: String!
    slug: String!
    description: String
    status: ProductStatus!
    brand: String
    createdAt: String!
    updatedAt: String!

    variants: [ProductVariant!]
    images: [ProductImage!]
    reviews: [Review!]
    category: Category
    wishlistItems: [WishlistItem!]
    productOffers: [ProductOffer!]
    deliveryOptions: [DeliveryOption!]
    warranty: [Warranty!]
    returnPolicy: [ReturnPolicy!]
  }

  input CreateProductInput {
    name: String!
    description: String
    status: ProductStatus
    categoryId: String
    brand: String
    variants: CreateProductVariantInput
    productOffers: [CreateProductOfferInput!]
    deliveryOptions: [CreateDeliveryOptionInput!]
    warranty: [CreateWarrantyInput!]
    returnPolicy: [CreateReturnPolicyInput!]
    images: [CreateProductImageInput!]!
  }
  type Query {
    getProducts: [Product!]!
    getProduct(productId: ID!): Product!
    getMyProducts: [Product!]!
  }

  type Mutation {
    addProduct(input: CreateProductInput!): Boolean
    deleteProduct(productId: ID!): Boolean
  }
`;
