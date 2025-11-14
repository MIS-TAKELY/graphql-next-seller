import gql from "graphql-tag";

export const customerTypeDefs = gql`
  type Customer {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    phone: String
    totalOrders: Int!
    totalSpent: Float!
    averageOrderValue: Float!
    lastOrderDate: DateTime
    createdAt: DateTime!
    rating: Float
  }

  type CustomerStats {
    totalCustomers: Int!
    totalRevenue: Float!
    averageRating: Float!
    activeCustomers: Int!
  }

  type GetCustomersResponse {
    customers: [Customer!]!
    stats: CustomerStats!
  }

  extend type Query {
    getCustomers: GetCustomersResponse!
  }

  scalar DateTime
`;

