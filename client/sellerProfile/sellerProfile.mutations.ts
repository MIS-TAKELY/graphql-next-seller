import { gql } from "@apollo/client";

export const SETUP_SELLER_PROFILE = gql`
  mutation SetupSellerProfile($input: SellerProfileSetupInput!) {
    setupSellerProfile(input: $input) {
      id
      shopName
      slug
      phone
      verificationStatus
      address {
        id
        city
        state
        country
      }
    }
  }
`;

