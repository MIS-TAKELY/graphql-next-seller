import { gql } from "graphql-tag";

export const shipmentTypeDefs = gql`
  enum ShipmentStatus {
    PENDING
    PROCESSING
    SHIPPED
    IN_TRANSIT
    OUT_FOR_DELIVERY
    DELIVERED
    RETURNED
    LOST
  }

  enum ShippingMethod {
    STANDARD
    EXPRESS
    OVERNIGHT
    SAME_DAY
  }

  scalar DateTime

  type Shipment {
    id: ID!
    orderId: String!
    trackingNumber: String
    carrier: String
    method: ShippingMethod!
    status: ShipmentStatus!
    shippedAt: DateTime
    deliveredAt: DateTime
    estimatedDelivery: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!

    order: Order!
  }
`;
