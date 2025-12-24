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

  enum DisputeStatus {
    PENDING
    APPROVED
    REJECTED
    RESOLVED
  }

  enum DisputeType {
    CANCEL
    RETURN
  }

  type OrderDispute {
    id: ID!
    orderId: ID!
    sellerOrderId: ID
    userId: ID!
    reason: String!
    description: String
    images: [String]
    status: DisputeStatus!
    type: DisputeType!
    createdAt: DateTime!
    updatedAt: DateTime!
    order: Order
    user: User
  }

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

  input ConfirmOrderInput {
    sellerOrderId: ID!
  }

  type ConfirmOrderResponse {
    sellerOrder: SellerOrder!
    order: Order!
  }

  type Query {
    getSellerOrders(limit:Int): getSellerOrdersResponse
    getActiveUsersForSeller: getActiveUsersForSellerResponse!
    getSellerDisputes(limit: Int!, offset: Int!): [OrderDispute!]!
  }

  type Mutation {
    confirmOrder(input: ConfirmOrderInput!): SellerOrder!
    updateSellerOrderStatus(
      sellerOrderId: String!
      status: String!
    ): SellerOrder!
    createShipment(
      orderId: String!
      trackingNumber: String!
      carrier: String!
    ): Shipment!
    bulkUpdateSellerOrderStatus(
      sellerOrderIds: [String!]!
      status: String!
    ): [SellerOrder!]!
    bulkCreateShipments(
      orderIds: [String!]!
      trackingNumber: String!
      carrier: String!
    ): [SellerOrder!]!
    updateDisputeStatus(disputeId: ID!, status: DisputeStatus!): OrderDispute!
  }
`;
