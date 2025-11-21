// servers/gql/types.ts
// Shared types for GraphQL resolvers

import type { OrderStatus, PrismaClient } from "@/app/generated/prisma";

// GraphQL Context type
export interface GraphQLContext {
  prisma: PrismaClient;
  user?: {
    id: string;
    email: string;
    roles: { role: "BUYER" | "SELLER" | "ADMIN" };
    clerkId: string;
  } | null;
}

// Common resolver parent/args types
export type ResolverParent = unknown;
export type ResolverArgs<T = Record<string, unknown>> = T;

// Generic resolver function type
export type ResolverFn<
  TParent = ResolverParent,
  TArgs = ResolverArgs,
  TResult = unknown
> = (
  parent: TParent,
  args: TArgs,
  context: GraphQLContext
) => Promise<TResult> | TResult;

// Seller Order input types
export interface ConfirmOrderInput {
  sellerOrderId: string;
}

export interface UpdateSellerOrderStatusInput {
  sellerOrderId: string;
  status: OrderStatus;
}

// Shipment input types
export interface CreateShipmentInput {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status?: string;
}

// Message input types
export interface SendMessageInput {
  conversationId: string;
  content?: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "SYSTEM";
  attachments?: Array<{
    url: string;
    type: "IMAGE" | "VIDEO" | "DOCUMENT";
  }>;
  clientId?: string;
}

// Product input types (simplified, extend as needed)
export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  // Add other fields as needed
}
