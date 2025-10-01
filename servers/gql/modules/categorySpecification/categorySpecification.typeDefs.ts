import gql from "graphql-tag";

export const categorySpecificationsTypeDefs = gql`
  scalar DateTime
  type CategorySpecification {
    id: ID!
    categoryId: String!
    key: String!
    label: String!
    placeholder: String
    createdAt: DateTime!
    updatedAt: DateTime!
    category: Category!
  }

  input CreateCategorySpecificationInput {
    categoryId: String!
    key: String!
    label: String!
    placeholder: String!
  }

  type Query {
    categorySpecifications(categoryId: ID!): [CategorySpecification!]!
  }

  type Mutation {
    createCategorySpecification(
      data: CreateCategorySpecificationInput!
    ): CategorySpecification!
  }
`;
