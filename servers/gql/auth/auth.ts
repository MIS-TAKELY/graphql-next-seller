import { GraphQLContext } from "../context";

export function requireAuth(ctx: GraphQLContext) {
  // console.log("context-->",ctx)
  if (!ctx.user) {
    throw new Error('Authentication required');
  }
  return ctx.user;
}

export function requireAdmin(ctx: GraphQLContext) {
  const user = requireAuth(ctx);
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  return user;
}

export function requireBuyer(ctx: GraphQLContext) {
  // console.log("context-->",ctx)
  const user = requireAuth(ctx);
  console.log("user-->",user)
  if (user.role !== 'BUYER') {
    throw new Error('Buyer access required');
  }
  return user;
}
export function requireSeller(ctx: GraphQLContext) {
  const user = requireAuth(ctx);
  if (user.role !== 'SELLER') {
    throw new Error('Seller access required');
  }
  return user;
}