// types/graphql/graphql.types.ts
// GraphQL context and resolver types

import type { PrismaClient } from "@/app/generated/prisma";
import type { Role } from "../common/enums";

// GraphQL Context type
export interface GraphQLContext {
  prisma: PrismaClient;
  user?: {
    id: string;
    email: string;
    roles: { role: Role };
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

