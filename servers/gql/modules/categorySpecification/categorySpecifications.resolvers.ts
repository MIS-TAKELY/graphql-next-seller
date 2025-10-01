import { PrismaClient } from "@/app/generated/prisma";
const prisma = new PrismaClient();

export const categorySpecificationResolvers = {
  Query: {
    categorySpecifications: async (_: any, { categoryId }: { categoryId: string }) => {
      return prisma.categorySpecification.findMany({
        where: { categoryId },
      });
    },
  },
  Mutation: {
    createCategorySpecification: async (
      _: any,
      { data }: { data: { categoryId: string; key: string; label: string; placeholder?: string } }
    ) => {
      return prisma.categorySpecification.create({
        data,
      });
    },
  },
};
