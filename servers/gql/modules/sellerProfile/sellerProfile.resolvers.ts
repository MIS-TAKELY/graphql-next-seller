import slugify from "slugify";
import { requireAuth } from "../../auth/auth";
import { GraphQLContext } from "../../context";

type SellerProfileAddressInput = {
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  country?: string | null;
  postalCode: string;
  phone?: string | null;
};

type SellerProfileSetupInput = {
  shopName: string;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  businessName?: string | null;
  businessRegNo?: string | null;
  businessType?: string | null;
  phone: string;
  altPhone?: string | null;
  supportEmail?: string | null;
  address: SellerProfileAddressInput;
};

const generateUniqueSlug = async (
  prisma: GraphQLContext["prisma"],
  baseValue: string
) => {
  const base = slugify(baseValue, { lower: true, strict: true });
  let slug = base || `shop-${Date.now()}`;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.sellerProfile.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      return slug;
    }
    slug = `${base}-${counter++}`;
  }
};

export const sellerProfileResolvers = {
  Query: {
    meSellerProfile: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      return ctx.prisma.sellerProfile.findUnique({
        where: { userId: user.id },
        include: { pickupAddress: true },
      });
    },
  },
  Mutation: {
    setupSellerProfile: async (
      _: unknown,
      { input }: { input: SellerProfileSetupInput },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const prisma = ctx.prisma;

      const existing = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (existing) {
        throw new Error("Seller profile already exists.");
      }

      const slug = await generateUniqueSlug(
        prisma,
        input.slug || input.shopName
      );

      const addressInput = input.address;

      const result = await prisma.$transaction(async (tx) => {
        const address = await tx.address.create({
          data: {
            userId: user.id,
            type: "WAREHOUSE",
            label: addressInput.label,
            line1: addressInput.line1,
            line2: addressInput.line2,
            city: addressInput.city,
            state: addressInput.state || addressInput.city,
            country: addressInput.country || "NP",
            postalCode: addressInput.postalCode,
            phone: addressInput.phone || input.phone,
            isDefault: true,
          },
        });

        if (user.role !== "SELLER") {
          await tx.user.update({
            where: { id: user.id },
            data: { role: "SELLER" },
          });
        }

        const profile = await tx.sellerProfile.create({
          data: {
            userId: user.id,
            shopName: input.shopName,
            slug,
            tagline: input.tagline,
            description: input.description,
            logo: input.logo,
            banner: input.banner,
            businessName: input.businessName,
            businessRegNo: input.businessRegNo,
            businessType: input.businessType,
            phone: input.phone,
            altPhone: input.altPhone,
            email: input.supportEmail,
            pickupAddressId: address.id,
            isActive: true,
          },
          include: { pickupAddress: true },
        });

        return profile;
      });

      return result;
    },
  },
  SellerProfile: {
    address: (
      parent: { address?: unknown; pickupAddress?: unknown; pickupAddressId?: string },
      _: unknown,
      ctx: GraphQLContext
    ) => {
      if (parent.address) return parent.address;
      if (parent.pickupAddress) return parent.pickupAddress;
      if (!parent.pickupAddressId) return null;
      return ctx.prisma.address.findUnique({
        where: { id: parent.pickupAddressId },
      });
    },
  },
};

