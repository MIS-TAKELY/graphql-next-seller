import gql from "graphql-tag";

export const dashboardTypeDefs = gql`
  type getTotalRevenueResponse {
    currentRevenue: Float!
    previousRevenue: Float!
    percentChange: Float!
  }

  type MonthlySales {
    name: String!
    total: Float!
  }

  type TopProduct {
    productId: String!
    productName: String!
    variantId: String
    sku: String
    image: String
    totalQuantity: Int!
    totalRevenue: Float!
  }

  type GetTopProductsResponse {
    products: [TopProduct!]!
    totalProducts: Int!
  }

  type Query {
    getTotalRevenue: getTotalRevenueResponse!
    getMonthlySales(year: Int!): [MonthlySales!]!

    "Get top selling products for the seller (by revenue)"
    getTopProducts(
      limit: Int = 10
      year: Int
      month: Int
    ): GetTopProductsResponse!
  }
`;
