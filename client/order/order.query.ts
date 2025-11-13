// lib/graphql/queries/orders.ts
import gql from "graphql-tag";

export const GET_SELLER_ORDER = gql`
  query GetSellerOrders {
    getSellerOrders {
      sellerOrders {
        id
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