import { gql } from "graphql-tag";

export const productImageTypeDefs = gql`
  enum ImageType {
    PRIMARY
    PROMOTIONAL
  }
  type ProductImage {
    id: ID!
    productId: String!
    variantId: String
    url: String!
    altText: String
    sortOrder: Int
    type: ImageType!
    product: Product!
  }
  input CreateProductImageInput {
    url: String!
    altText: String
    type: ImageType!
    sortOrder: Int
  }
`;
