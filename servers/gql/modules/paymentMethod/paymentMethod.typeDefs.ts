import { gql } from "graphql-tag";

export const paymentMethodTypeDefs = gql`
  enum PaymentMethodType {
    CREDIT_CARD
    DEBIT_CARD
    UPI
    NET_BANKING
    WALLET
    CASH_ON_DELIVERY
  }

  scalar DateTime

  type PaymentMethod {
    id: ID!
    userId: String!
    type: PaymentMethodType!
    provider: String!
    last4: String
    expiryMonth: Int
    expiryYear: Int
    upiId: String
    isDefault: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!

    user: User!
    Payment: [Payment!]
  }
`;
