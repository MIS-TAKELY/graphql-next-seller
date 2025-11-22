// servers/gql/types.ts
// Shared types for GraphQL resolvers
// Re-export from centralized types

export type {
  GraphQLContext,
  ResolverParent,
  ResolverArgs,
  ResolverFn,
} from "@/types/graphql/graphql.types";

export type {
  ConfirmOrderInput,
  UpdateSellerOrderStatusInput,
  CreateShipmentInput,
} from "@/types/order/order-api.types";

export type { SendMessageInput } from "@/types/customer/message-api.types";
