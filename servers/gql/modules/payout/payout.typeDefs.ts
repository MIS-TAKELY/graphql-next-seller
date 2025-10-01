import { gql } from "graphql-tag";

export const payoutTypeDefs = gql`
  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  scalar Decimal
  scalar DateTime

  type Payout {
    id: ID!
    sellerId: String!
    amount: Decimal!
    currency: String!
    status: PaymentStatus!
    scheduledFor: DateTime!
    processedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!

    seller: User!
  }
`;
