import { gql } from "graphql-tag";

export const productImageTypeDefs = gql`
  enum MediaType {
    PRIMARY
    PROMOTIONAL
  }

  enum FileType {
    IMAGE
    VIDEO
  }
  type ProductImage {
    id: ID!
    productId: String!
    variantId: String
    url: String!
    altText: String
    sortOrder: Int
    mediaType: MediaType!
    fileType: FileType!
    product: Product!
  }
  input CreateProductImageInput {
    url: String!
    altText: String
    mediaType: MediaType!
    fileType: FileType!
    sortOrder: Int
  }
`;
