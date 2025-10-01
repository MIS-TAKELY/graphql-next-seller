import { gql } from "graphql-tag";

export const reviewTypeDefs = gql`
  scalar DateTime

  type Review {
    id: ID!
    userId: String!
    productId: String!
    rating: Int!
    comment: String
    createdAt: DateTime!
    updatedAt: DateTime!

    user: User!
    product: Product!
  }
`;


