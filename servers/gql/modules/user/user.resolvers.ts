import { requireAuth } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const userResolvers = {
    Query: {
        me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
            const user = requireAuth(ctx);
            return ctx.prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    roles: true,
                    sellerProfile: true,
                },
            });
        },
    },
};
