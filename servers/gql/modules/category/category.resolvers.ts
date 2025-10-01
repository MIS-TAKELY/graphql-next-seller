import { PrismaClient } from "@/app/generated/prisma";
import { generateUniqueSlug } from "@/servers/utils/slugfy";

const prisma = new PrismaClient();

export const categoryResolvers = {
  Query: {
    categories: async () => {
      return prisma.category.findMany({
        where:{
          children:{
            some:{}
          }
        },
        include: { children: {
          include:{
            categorySpecification:true
          }
        }, parent: true, categorySpecification: true },
      });
    },
    category: async (_: any, { id }: { id: string }) => {
      return prisma.category.findUnique({
        where: { id },
        include: { children: true, parent: true },
      });
    },
  },
  Mutation: {
    createCategory: async (
      _: any,
      {
        data,
      }: {
        data: {
          name: string;
          description?: string;
          parentId?: string;
          isActive?: boolean;
        };
      }
    ) => {
      const slug = await generateUniqueSlug(data.name);
      return prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          parentId: data.parentId || null, // root category if null
          isActive: data.isActive ?? true,
        },
        include: { parent: true, children: true },
      });
    },
    createSubCategory: async (
      _: any,
      {
        data,
      }: {
        data: {
          name: string;
          description?: string;
          parentId: string;
          isActive?: boolean;
        };
      }
    ) => {
      const slug = await generateUniqueSlug(data.name);
      return prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          parentId: data.parentId,
          isActive: data.isActive ?? true,
        },
        include: { parent: true, children: true },
      });
    },
  },
};
