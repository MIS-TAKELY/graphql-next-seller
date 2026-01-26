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

export const GET_SELLER_ORDER_FOR_DASHBOARD = gql`
  query GetSellerOrders {
    getSellerOrders(limit: 5) {
      currentOrderCount
      previousOrderCount
      percentChange
      sellerOrders {
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

export const GET_DASHBOARD_RECENT_ORDERS = gql`
  query getRecentOrders {
    getSellerOrders(limit: 5) {
      sellerOrders {
        id
        buyerOrderId
        status
        subtotal
        tax
        shippingFee
        commission
        total
        createdAt
        updatedAt
        order {
          id
          orderNumber
          status
          shippingSnapshot
          billingSnapshot
          buyer {
            id
            email
            firstName
            lastName
            phone
            avatarImageUrl
          }
          payments {
            id
            provider
            status
            amount
            transactionId
          }
          shipments {
            id
            trackingNumber
            carrier
            status
            shippedAt
            deliveredAt
            estimatedDelivery
          }
        }
        items {
          id
          quantity
          unitPrice
          totalPrice
          commission
          variant {
            id
            sku
            price
            mrp
            attributes
            product {
              id
              name
              slug
              brand
              images {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;
