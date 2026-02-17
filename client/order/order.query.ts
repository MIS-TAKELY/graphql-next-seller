// lib/graphql/queries/orders.ts
import gql from "graphql-tag";

export const GET_SELLER_ORDER = gql`
  query GetSellerOrders {
    getSellerOrders {
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
            name
            firstName
            lastName
            phone
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

export const GET_SELLER_DISPUTES = gql`
  query GetSellerDisputes($limit: Int!, $offset: Int!) {
    getSellerDisputes(limit: $limit, offset: $offset) {
      id
      orderId
      userId
      reason
      description
      images
      status
      type
      createdAt
      user {
        id
        firstName
        lastName
        email
      }
      order {
        id
        orderNumber
        items {
          id
          quantity
          unitPrice
          variant {
            id
            product {
              id
              name
              images {
                url
              }
            }
          }
        }
      }
    }
  }
`;
