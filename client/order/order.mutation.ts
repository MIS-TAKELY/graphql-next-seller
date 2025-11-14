// client/order/order.mutation.ts

import { gql } from '@apollo/client';

export const UPDATE_SELLER_ORDER_STATUS = gql`
  mutation UpdateSellerOrderStatus($sellerOrderId: String!, $status: String!) {
    updateSellerOrderStatus(sellerOrderId: $sellerOrderId, status: $status) {
      id
      status
    }
  }
`;

export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($orderId: String!, $trackingNumber: String!, $carrier: String!) {
    createShipment(orderId: $orderId, trackingNumber: $trackingNumber, carrier: $carrier) {
      id
      trackingNumber
      status
    }
  }
`;

export const CONFIRM_ORDER = gql`
  mutation ConfirmOrder($input: ConfirmOrderInput!) {
    confirmOrder(input: $input)
  }
`;