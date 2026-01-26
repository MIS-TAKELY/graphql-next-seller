import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import gql from "graphql-tag";
import { addressResolvers } from "./modules/address/address.resolvers";
import { addressTypeDefs } from "./modules/address/address.typeDefs";
import { brandTypeDefs } from "./modules/brand/brand.typedefs";
import { cartItemTypeDefs } from "./modules/cartItem/cartitem.typedefs";
import { categoryResolvers } from "./modules/category/category.resolvers";
import { categoryTypeDefs } from "./modules/category/category.typeDefs";
import { categorySpecificationsTypeDefs } from "./modules/categorySpecification/categorySpecification.typeDefs";
import { categorySpecificationResolvers } from "./modules/categorySpecification/categorySpecifications.resolvers";
import { conversationResolvers } from "./modules/conversation/conversation.resolvers";
import { conversationTypedefs } from "./modules/conversation/conversaton.typeDefs";
import { customerResolvers } from "./modules/customer/customer.resolvers";
import { customerTypeDefs } from "./modules/customer/customer.typeDefs";
import { analyticsResolvers } from "./modules/analytics/analytics.resolvers";
import { analyticsTypeDefs } from "./modules/analytics/analytics.typeDefs";
import { dashboardResolvers } from "./modules/dashboard/dashboard.resolvers";
import { dashboardTypeDefs } from "./modules/dashboard/dashboard.typeDefs";
import { deliveryTypedefs } from "./modules/delivery/delivery.typeDefs";
import { faqResolvers } from "./modules/faq/faq.resolvers";
import { faqTypeDefs } from "./modules/faq/faq.typeDefs";
import { messageResolvers } from "./modules/message/message.resolvers";
import { messageTypedefs } from "./modules/message/message.typeDefs";
import { offerTypeDefs } from "./modules/offer/offer.typedefs";
import { orderTypeDefs } from "./modules/order/order.typeDefs";
import { orderItemTypeDefs } from "./modules/orderItem/orderItem.typeDefs";
import { paymentTypeDefs } from "./modules/payment/payment.typeDefs";
import { paymentMethodTypeDefs } from "./modules/paymentMethod/paymentMethod.typeDefs";
import { payoutTypeDefs } from "./modules/payout/payout.typeDefs";
import { productImageTypeDefs } from "./modules/productImage/productImage.typeDefs";
import { productResolvers } from "./modules/products/product.resolvers";
import { productTypeDefs } from "./modules/products/product.typeDefs";
import { productSpecificationTypeDefs } from "./modules/productSpecification/productSpecification.typeDefs";
import { productVariantTypeDefs } from "./modules/productVariant/productVariant.typeDefs";
import { returnResolvers } from "./modules/return/return.resolvers";
import { returnTypedefs } from "./modules/return/return.typeDefs";
import { reviewTypeDefs } from "./modules/review/review.typeDefs";
import { sellerOrderResolver } from "./modules/sellerOrder/sellerOrder.resolvers";
import { sellerOrderTypeDefs } from "./modules/sellerOrder/sellerOrder.typeDefs";
import { sellerOrderItemTypeDefs } from "./modules/sellerOrderItem/sellerOrderItem.typeDefs";
import { shipmentTypeDefs } from "./modules/shipment/shipment.typeDefs";
import { sellerProfileResolvers } from "./modules/sellerProfile/sellerProfile.resolvers";
import { sellerProfileTypeDefs } from "./modules/sellerProfile/sellerProfile.typeDefs";
import { userTypeDefs } from "./modules/user/user.typeDefs";
import { userResolvers } from "./modules/user/user.resolvers";
import { warrentyTypeDefs } from "./modules/warrenty/warrenty.typeDefs";
import { wishlistTypeDefs } from "./modules/wishlist/wishlist.typeDefs";
import { wishlistItemTypeDefs } from "./modules/wishlistItem/wishlistItem.typeDefs";

const rootTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const typeDefs = mergeTypeDefs([
  rootTypeDefs,
  addressTypeDefs,
  brandTypeDefs,
  cartItemTypeDefs,
  categoryTypeDefs,
  categorySpecificationsTypeDefs,
  deliveryTypedefs,
  offerTypeDefs,
  orderTypeDefs,
  orderItemTypeDefs,
  paymentTypeDefs,
  paymentMethodTypeDefs,
  payoutTypeDefs,
  productImageTypeDefs,
  productTypeDefs,
  productSpecificationTypeDefs,
  productVariantTypeDefs,
  returnTypedefs,
  reviewTypeDefs,
  sellerOrderTypeDefs,
  sellerOrderItemTypeDefs,
  shipmentTypeDefs,
  userTypeDefs,
  wishlistTypeDefs,
  wishlistItemTypeDefs,
  warrentyTypeDefs,
  messageTypedefs,
  conversationTypedefs,
  dashboardTypeDefs,
  analyticsTypeDefs,
  customerTypeDefs,
  faqTypeDefs,
  sellerProfileTypeDefs,
]);

const resolvers = mergeResolvers([
  addressResolvers,
  faqResolvers,
  productResolvers,
  returnResolvers,
  categoryResolvers,
  categorySpecificationResolvers,
  messageResolvers,
  conversationResolvers,
  dashboardResolvers,
  sellerOrderResolver,
  analyticsResolvers,
  customerResolvers,
  sellerProfileResolvers,
  userResolvers,
]);

export const schema = makeExecutableSchema({ typeDefs, resolvers });
