import { gql } from "graphql-tag";

export const productSpecificationTypeDefs = gql`
  scalar DateTime

  type ProductSpecification {
    id: ID!
    variantId: String!
    key: String!
    value: String!
    createdAt: String!
    updatedAt: String!
    variant: ProductVariant!
  }

  input CreateSpecificationInput {
    key: String!
    value: String!
  }
`;
