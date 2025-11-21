import { gql } from "@apollo/client";

export const GET_MY_SELLER_PROFILE = gql`
  query MeSellerProfile {
    meSellerProfile {
      id
      shopName
      slug
      tagline
      description
      logo
      banner
      businessName
      businessRegNo
      businessType
      phone
      altPhone
      email
      verificationStatus
      isActive
      address {
        id
        label
        line1
        line2
        city
        state
        postalCode
        country
        phone
      }
    }
  }
`;

