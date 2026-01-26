import { gql } from "@apollo/client";

export const GET_SELLER_RETURNS = gql`
  query SellerReturns($limit: Int, $offset: Int, $status: ReturnStatus) {
    sellerReturns(limit: $limit, offset: $offset, status: $status) {
      id
      orderId
      userId
      status
      refundStatus
      reason
      description
      type
      createdAt
      user {
        name
        email
      }
      order {
        orderNumber
      }
      items {
        id
        quantity
        reason
        orderItem {
          id
          variant {
            product {
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

export const UPDATE_RETURN_STATUS = gql`
  mutation UpdateReturnStatus($input: UpdateReturnStatusInput!) {
    updateReturnStatus(input: $input) {
      id
      status
      refundStatus
    }
  }
`;
