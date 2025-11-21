import { gql } from "graphql-tag";

export const sellerProfileTypeDefs = gql`
  enum VerificationStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type SellerProfile {
    id: ID!
    userId: ID!
    shopName: String!
    slug: String!
    logo: String
    banner: String
    description: String
    tagline: String
    businessName: String
    businessRegNo: String
    businessType: String
    phone: String!
    altPhone: String
    email: String
    verificationStatus: VerificationStatus!
    verifiedAt: DateTime
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    address: Address
  }

  input SellerProfileAddressInput {
    label: String
    line1: String!
    line2: String
    city: String!
    state: String
    country: String
    postalCode: String!
    phone: String
  }

  input SellerProfileSetupInput {
    shopName: String!
    slug: String
    tagline: String
    description: String
    logo: String
    banner: String
    businessName: String
    businessRegNo: String
    businessType: String
    phone: String!
    altPhone: String
    supportEmail: String
    address: SellerProfileAddressInput!
  }

  extend type Query {
    meSellerProfile: SellerProfile
  }

  extend type Mutation {
    setupSellerProfile(input: SellerProfileSetupInput!): SellerProfile!
  }
`;

