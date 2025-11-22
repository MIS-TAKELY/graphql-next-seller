import gql from "graphql-tag";

export const offerTypeDefs = gql`
  type Offer {
    id: ID!
    title: String!
    description: String
    type: DiscountType!
    value: Float
    bannerImage: String
    startDate: String!
    endDate: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!

    productOffers: [ProductOffer!]
    categoryOffers: [CategoryOffer!]
  }

  type ProductOffer {
    id: ID!
    offerId: String!
    productId: String!
    createdAt: String!

    offer: Offer!
    product: Product!
  }

  type CategoryOffer {
    id: ID!
    offerId: String!
    categoryId: String!
    createdAt: String!

    offer: Offer!
    category: Category!
  }
  #input CreateProductOfferInput {
  #  offer: CreateOfferInput!
  #}

  input OfferInput {
    title: String!
    description: String
    type: DiscountType!
    value: Float!
    startDate: String!
    endDate: String!
    isActive: Boolean
  }

   input CreateProductOfferInput {
    offer: OfferInput!
  }


  input CreateOfferInput {
    title: String!
    description: String
    type: DiscountType!
    value: Float!
    startDate: DateTime!
    endDate: DateTime!
    bannerImage: String
  }
`;
