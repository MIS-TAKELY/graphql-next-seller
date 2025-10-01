import gql from "graphql-tag";

export const deliveryTypedefs = gql`
  type DeliveryOption {
    id: ID!
    productId: String!
    title: String!
    description: String
    isDefault: Boolean!
    createdAt: String!
    updatedAt: String!

    product: Product!
  }

  input CreateDeliveryOptionInput {
    title: String!
    description: String
    isDefault: Boolean
  }
`;
