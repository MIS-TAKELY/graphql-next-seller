import { gql } from "graphql-tag";

export const cartItemTypeDefs = gql`
  scalar DateTime

  type CartItem {
    id: ID!
    userId: String!
    variantId: String!
    quantity: Int!
    createdAt: DateTime!
    updatedAt: DateTime!

    user: User!
    variant: ProductVariant!
  }
`;
