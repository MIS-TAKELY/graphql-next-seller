import gql from "graphql-tag";

export const GET_OVERVIEW_ANALYTICS = gql`
  query GetOverviewAnalytics($period: TimePeriod!) {
    getOverviewAnalytics(period: $period) {
      metrics {
        totalRevenue {
          current
          previous
          percentChange
          formatted
        }
        orders {
          current
          previous
          percentChange
        }
        conversionRate {
          current
          previous
          percentChange
        }
        customerSatisfaction {
          current
          previous
          percentChange
        }
      }
      salesData {
        name
        sales
        revenue
        orders
      }
      productData {
        name
        value
        color
      }
    }
  }
`;

export const GET_SALES_ANALYTICS = gql`
  query GetSalesAnalytics($period: TimePeriod!) {
    getSalesAnalytics(period: $period) {
      metrics {
        dailySales {
          current
          previous
          percentChange
          formatted
        }
        weeklySales {
          current
          previous
          percentChange
          formatted
        }
        monthlySales {
          current
          previous
          percentChange
          formatted
        }
        averageOrderValue {
          current
          previous
          percentChange
          formatted
        }
      }
      salesTrends {
        name
        sales
        revenue
        orders
      }
    }
  }
`;

export const GET_PRODUCTS_ANALYTICS = gql`
  query GetProductsAnalytics($period: TimePeriod!) {
    getProductsAnalytics(period: $period) {
      metrics {
        totalProducts
        lowStock
        outOfStock
        bestSellerRate
      }
      productPerformance {
        productId
        productName
        sales
        revenue
        orders
      }
    }
  }
`;

export const GET_CUSTOMERS_ANALYTICS = gql`
  query GetCustomersAnalytics($period: TimePeriod!) {
    getCustomersAnalytics(period: $period) {
      metrics {
        totalCustomers
        newCustomers
        repeatCustomerRate
        averageLifetimeValue
      }
      customerAcquisition {
        name
        customers
      }
    }
  }
`;

