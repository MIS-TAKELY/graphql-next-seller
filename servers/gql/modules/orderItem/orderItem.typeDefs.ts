import { gql } from "graphql-tag";

export const orderItemTypeDefs = gql`
  scalar Decimal
  scalar DateTime

  type OrderItem {
    id: ID!
    orderId: String!
    variantId: String!
    quantity: Int!
    unitPrice: Decimal!
    totalPrice: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!

    order: Order!
    variant: ProductVariant!
  }
`;
