import gql from "graphql-tag";

export const warrentyTypeDefs = gql`
  enum WarrantyType {
    MANUFACTURER
    SELLER
    NO_WARRANTY
  }
  type Warranty {
    id: ID!
    productId: String!
    type: WarrantyType!
    duration: Int
    unit: String
    description: String
    createdAt: String!
    updatedAt: String!

    product: Product!
  }

  input CreateWarrantyInput {
    type: WarrantyType!
    duration: Int
    unit: String
    description: String
  }
`;
