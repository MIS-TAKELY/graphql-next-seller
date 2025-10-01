import { gql } from "graphql-tag";

export const categoryTypeDefs = gql`
  scalar DateTime
  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    parentId: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!

    parent: Category
    children: [Category!]!
    products: [Product!]!
    categorySpecification: [CategorySpecification!]!
  }

  input CreateCategoryInput {
    name: String!
    description: String
    parentId: String
    isActive: Boolean
  }

   input CreateSubCategoryInput {
    name: String!
    description: String
    parentId: String!
    isActive: Boolean
  }

  type Mutation {
    createCategory(data: CreateCategoryInput!): Category!
    createSubCategory(data: CreateSubCategoryInput!): Category!
  }

  type Query {
    categories: [Category!]!
    category(id: ID!): Category
  }
`;


