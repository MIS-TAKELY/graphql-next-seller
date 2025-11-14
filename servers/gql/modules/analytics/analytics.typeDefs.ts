import gql from "graphql-tag";

export const analyticsTypeDefs = gql`
  enum TimePeriod {
    DAYS_7
    DAYS_30
    DAYS_90
    YEAR_1
  }

  type RevenueMetric {
    current: Float!
    previous: Float!
    percentChange: Float!
    formatted: String!
  }

  type OrdersMetric {
    current: Int!
    previous: Int!
    percentChange: Float!
  }

  type ConversionRateMetric {
    current: Float!
    previous: Float!
    percentChange: Float!
  }

  type CustomerSatisfactionMetric {
    current: Float!
    previous: Float!
    percentChange: Float!
  }

  type OverviewMetrics {
    totalRevenue: RevenueMetric!
    orders: OrdersMetric!
    conversionRate: ConversionRateMetric!
    customerSatisfaction: CustomerSatisfactionMetric!
  }

  type SalesDataPoint {
    name: String!
    sales: Float!
    revenue: Float!
    orders: Int!
  }

  type ProductDataPoint {
    name: String!
    value: Float!
    color: String!
  }

  type OverviewData {
    metrics: OverviewMetrics!
    salesData: [SalesDataPoint!]!
    productData: [ProductDataPoint!]!
  }

  type SalesMetrics {
    dailySales: RevenueMetric!
    weeklySales: RevenueMetric!
    monthlySales: RevenueMetric!
    averageOrderValue: RevenueMetric!
  }

  type SalesTabData {
    metrics: SalesMetrics!
    salesTrends: [SalesDataPoint!]!
  }

  type ProductMetrics {
    totalProducts: Int!
    lowStock: Int!
    outOfStock: Int!
    bestSellerRate: Float!
  }

  type ProductPerformance {
    productId: String!
    productName: String!
    sales: Float!
    revenue: Float!
    orders: Int!
  }

  type ProductsTabData {
    metrics: ProductMetrics!
    productPerformance: [ProductPerformance!]!
  }

  type CustomerMetrics {
    totalCustomers: Int!
    newCustomers: Int!
    repeatCustomerRate: Float!
    averageLifetimeValue: Float!
  }

  type CustomerAcquisition {
    name: String!
    customers: Int!
  }

  type CustomersTabData {
    metrics: CustomerMetrics!
    customerAcquisition: [CustomerAcquisition!]!
  }

  type Query {
    getOverviewAnalytics(period: TimePeriod!): OverviewData!
    getSalesAnalytics(period: TimePeriod!): SalesTabData!
    getProductsAnalytics(period: TimePeriod!): ProductsTabData!
    getCustomersAnalytics(period: TimePeriod!): CustomersTabData!
  }
`;

