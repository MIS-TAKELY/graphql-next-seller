import gql from "graphql-tag";

export const GET_REVENUE = gql`
  query GetTotalRevenue {
    getTotalRevenue {
      currentRevenue
      percentChange
      previousRevenue
    }
  }
`;

export const GET_SELLER_ORDER = gql`
  query getSellerOrders {
    getSellerOrders {
      currentOrderCount
      previousOrderCount
      percentChange
      sellerOrder {
        id
      }
    }
  }
`;

export const DASHBOARD_PRODUCTS = gql`
  query GetMyProducts {
    getMyProducts {
      percentChange
      products {
        id
      }
    }
  }
`;

export const DASHBOARD_ACTIVE_CUSTOMER = gql`
  query GetActiveUsersForSeller {
    getActiveUsersForSeller {
      currentActiveUsers
      percentChange
      previousActiveUsers
    }
  }
`;

export const DASHBOARD_GET_MONTHLY_SALES = gql`
  query getMonthlySales($year: Int!) {
    getMonthlySales(year: $year) {
      name
      total
    }
  }
`;
