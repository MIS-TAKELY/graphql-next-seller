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
import { deliveryTypedefs } from "./modules/delivery/delivery.typeDefs";
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
import { returnTypedefs } from "./modules/return/return.typeDefs";
import { reviewTypeDefs } from "./modules/review/review.typeDefs";
import { sellerOrderTypeDefs } from "./modules/sellerOrder/sellerOrder.typeDefs";
import { sellerOrderItemTypeDefs } from "./modules/sellerOrderItem/sellerOrderItem.typeDefs";
import { shipmentTypeDefs } from "./modules/shipment/shipment.typeDefs";
import { userTypeDefs } from "./modules/user/user.typeDefs";
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
]);

const resolvers = mergeResolvers([
  addressResolvers,
  productResolvers,
  categoryResolvers,
  categorySpecificationResolvers,
]);

export const schema = makeExecutableSchema({ typeDefs, resolvers });
