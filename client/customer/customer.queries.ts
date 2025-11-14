import gql from "graphql-tag";

export const GET_CUSTOMERS = gql`
  query GetCustomers {
    getCustomers {
      customers {
        id
        email
        firstName
        lastName
        phone
        totalOrders
        totalSpent
        averageOrderValue
        lastOrderDate
        createdAt
        rating
      }
      stats {
        totalCustomers
        totalRevenue
        averageRating
        activeCustomers
      }
    }
  }
`;

