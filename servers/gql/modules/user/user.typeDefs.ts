import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  enum Role {
    BUYER
    SELLER
    ADMIN
  }

  scalar DateTime

  type User {
    id: ID!
    clerkId: String!
    email: String!
    firstName: String
    lastName: String
    phone: String
    role: Role!
    createdAt: DateTime!
    updatedAt: DateTime!

    addresses: [Address!]
    paymentMethods: [PaymentMethod!]
    cartItems: [CartItem!]
    orders: [Order!]
    reviews: [Review!]
    products: [Product!]
    payouts: [Payout!]
    sellerOrders: [SellerOrder!]
    Wishlist: [Wishlist!]
  }
`;
