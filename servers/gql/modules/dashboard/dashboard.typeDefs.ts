import gql from "graphql-tag";

export const dashboardTyprDefs = gql`
  type getTotalRevenueResponse {
    currentRevenue: Float
    previousRevenue: Float
    percentChange: Float
  }

  type MonthlySales {
    name: String!
    total: Float!
  }

  type Query {
    getTotalRevenue: getTotalRevenueResponse!
    getMonthlySales(year: Int!): [MonthlySales!]!
  }
`;
