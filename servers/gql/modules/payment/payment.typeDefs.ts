import { gql } from "graphql-tag";

export const paymentTypeDefs = gql`
  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  scalar Decimal
  scalar DateTime

  type Payment {
    id: ID!
    orderId: String!
    methodId: String
    amount: Decimal!
    currency: String!
    status: PaymentStatus!
    transactionId: String
    provider: String!
    createdAt: DateTime!
    updatedAt: DateTime!

    order: Order!
    method: PaymentMethod
  }
`;
