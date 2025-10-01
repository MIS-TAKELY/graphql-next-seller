import { gql } from "graphql-tag";

export const orderTypeDefs = gql`
  # ENUMS
  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    RETURNED
  }

  # SCALARS
  scalar DateTime
  scalar Decimal
  scalar Json

  # ORDER
  type Order {
    id: ID!
    orderNumber: String!
    buyerId: String!
    status: OrderStatus!
    shippingSnapshot: Json!
    billingSnapshot: Json
    subtotal: Decimal!
    tax: Decimal!
    shippingFee: Decimal!
    discount: Decimal!
    total: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!
    buyer: User
    items: [OrderItem]
    payments: [Payment]
    shipments: [Shipment]
  }
`;
