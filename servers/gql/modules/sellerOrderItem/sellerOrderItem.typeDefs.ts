import { gql } from "graphql-tag";

export const sellerOrderItemTypeDefs = gql`
  scalar Decimal
  scalar DateTime

  type SellerOrderItem {
    id: ID!
    sellerOrderId: String!
    variantId: String!
    quantity: Int!
    unitPrice: Decimal!
    totalPrice: Decimal!
    commission: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!

    sellerOrder: SellerOrder!
    variant: ProductVariant!
  }
`;
