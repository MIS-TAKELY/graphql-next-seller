import { gql } from "graphql-tag";

export const brandTypeDefs = gql`
  scalar DateTime

  type Brand {
    id: ID!
    name: String!
    slug: String!
    createdAt: DateTime!
    updatedAt: DateTime!

    products: [Product!]
  }
`;
