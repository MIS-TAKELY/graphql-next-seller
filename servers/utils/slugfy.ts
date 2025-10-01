import { prisma } from "@/lib/db/prisma";
import slugify from "slugify";

export async function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let uniqueSlug = baseSlug;
  let counter = 1;

  // Check if slug exists
  while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
