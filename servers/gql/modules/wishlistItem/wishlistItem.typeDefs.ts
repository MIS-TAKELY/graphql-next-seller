import { gql } from "graphql-tag";

export const wishlistItemTypeDefs = gql`
  scalar DateTime

  type WishlistItem {
    id: ID!
    wishlistId: String!
    productId: String!
    createdAt: DateTime!

    wishlist: Wishlist!
    product: Product!
  }
`;
