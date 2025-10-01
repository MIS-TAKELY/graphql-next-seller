import { gql } from "graphql-tag";

export const wishlistTypeDefs = gql`
  scalar DateTime

  type Wishlist {
    id: ID!
    userId: String!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!

    user: User!
    items: [WishlistItem!]
  }
`;
