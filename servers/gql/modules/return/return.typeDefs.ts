import gql from "graphql-tag";


export const returnTypedefs = gql`
  enum ReturnPolicyType {
    NO_RETURN
    REPLACEMENT
    REFUND
    REPLACEMENT_OR_REFUND
  }

  type ReturnPolicy {
    id: ID!
    productId: String!
    type: ReturnPolicyType!
    duration: Int
    unit: String
    conditions: String
    createdAt: String!
    updatedAt: String!
    product: Product!
  }

  input CreateReturnPolicyInput {
    type: ReturnPolicyType!
    duration: Int
    unit: String
    conditions: String
  }

  enum ReturnStatus {
    REQUESTED
    APPROVED
    REJECTED
    PICKUP_SCHEDULED
    IN_TRANSIT
    RECEIVED
    INSPECTED
    ACCEPTED
    DENIED
    CANCELLED
  }

  enum RefundStatus {
    PENDING
    INITIATED
    COMPLETED
    FAILED
    NOT_APPLICABLE
  }

  enum RefundMethod {
    ORIGINAL_PAYMENT
    WALLET
    BANK_TRANSFER
  }

  enum LogisticsMode {
    PLATFORM_PICKUP
    SELF_SHIP
  }

  enum ReturnRequestType {
    REFUND
    REPLACEMENT
  }

  type ReturnItem {
    id: ID!
    returnId: String!
    orderItemId: String!
    quantity: Int!
    reason: String
    orderItem: OrderItem!
  }

  type Return {
    id: ID!
    orderId: String!
    userId: String!
    status: ReturnStatus!
    refundStatus: RefundStatus!
    refundMethod: RefundMethod
    refundAmount: Float
    reason: String!
    description: String
    images: [String!]
    type: ReturnRequestType!
    logisticsMode: LogisticsMode!
    trackingNumber: String
    pickupAddressId: String
    createdAt: String!
    updatedAt: String!
    pickupScheduledAt: String
    receivedAt: String
    inspectedAt: String
    rejectionReason: String

    order: Order!
    user: User!
    items: [ReturnItem!]!
  }

  input ReturnItemInput {
    orderItemId: String!
    quantity: Int!
    reason: String
  }

  input CreateReturnInput {
    orderId: String!
    reason: String!
    description: String
    images: [String!]
    type: ReturnRequestType!
    logisticsMode: LogisticsMode
    pickupAddressId: String
    items: [ReturnItemInput!]!
    refundMethod: RefundMethod
  }

  input UpdateReturnStatusInput {
    returnId: String!
    status: ReturnStatus!
    rejectionReason: String
  }

  type Query {
    myReturns(limit: Int, offset: Int): [Return!]!
    getReturn(id: ID!): Return
    sellerReturns(limit: Int, offset: Int, status: ReturnStatus): [Return!]!
  }

  type Mutation {
    createReturnRequest(input: CreateReturnInput!): Return!
    updateReturnStatus(input: UpdateReturnStatusInput!): Return!
  }
`;
