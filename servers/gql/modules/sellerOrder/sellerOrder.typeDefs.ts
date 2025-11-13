import { gql } from "graphql-tag";

export const sellerOrderTypeDefs = gql`
  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    RETURNED
  }

  scalar Decimal
  scalar DateTime

  type SellerOrder {
    id: ID!
    sellerId: String!
    buyerOrderId: String!
    status: OrderStatus!
    subtotal: Decimal!
    tax: Decimal!
    shippingFee: Decimal!
    commission: Decimal!
    total: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!

    seller: User!
    items: [SellerOrderItem!]
    order: Order
  }

  type getSellerOrdersResponse {
    sellerOrders: [SellerOrder!]!
    currentOrderCount: Float
    previousOrderCount: Float
    percentChange: Float
  }

  type getActiveUsersForSellerResponse {
    currentActiveUsers: Float
    previousActiveUsers: Float
    percentChange: Float
  }

  type Query {
    getSellerOrders: getSellerOrdersResponse
    getActiveUsersForSeller: getActiveUsersForSellerResponse!
  }
`;
