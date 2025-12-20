import { gql } from "graphql-tag";

export const productVariantTypeDefs = gql`
  scalar Decimal
  scalar Json
  scalar DateTime
  type ProductVariant {
    id: ID!
    productId: String!
    sku: String!
    price: Float!
    mrp: Float!
    stock: Int!
    soldCount: Int
    attributes: Json
    isDefault: Boolean!
    specificationTable: Json
    createdAt: String!
    updatedAt: String!

    specifications: [ProductSpecification!]
    product: Product!
  }

  input CreateProductVariantInput {
    sku: String!
    price: Float!
    mrp: Float!
    stock: Int!
    attributes: Json
    isDefault: Boolean
    specifications: [CreateSpecificationInput!]
    specificationTable: Json
  }

  input UpdateProductVariantInput {
    id: ID # Only for updating existing variants
    sku: String
    price: Float
    mrp: Float
    stock: Int
    attributes: Json
    isDefault: Boolean
    specifications: [CreateSpecificationInput]
    specificationTable: Json
  }
`;
