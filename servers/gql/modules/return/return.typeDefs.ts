import gql from "graphql-tag";

export const returnTypedefs = gql`
  enum ReturnType {
    NO_RETURN
    REPLACEMENT
    REFUND
    REPLACEMENT_OR_REFUND
  }
  type ReturnPolicy {
    id: ID!
    productId: String!
    type: ReturnType!
    duration: Int
    unit: String
    conditions: String
    createdAt: String!
    updatedAt: String!

    product: Product!
  }
  input CreateReturnPolicyInput {
    type: ReturnType!
    duration: Int
    unit: String
    conditions: String
  }
`;
