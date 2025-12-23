import { prisma } from "@/lib/db/prisma";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
async function createOrGetSeller(
  email: string,
  firstName: string = "Seller",
  lastName: string = "Account"
) {
  let seller = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!seller) {
    const baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    // Ensure unique username
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    seller = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        roles: {
          create: [
            {
              role: "SELLER",
            },
          ],
        },
      },
      include: { roles: true },
    });
    console.log(`Created seller: ${email} with username ${username} and SELLER role`);
  } else {
    // Check if user already has SELLER role
    const hasSellerRole = seller.roles.some((r) => r.role === "SELLER");

    if (!hasSellerRole && seller) {
      await prisma.userRole.create({
        data: {
          userId: seller.id,
          role: "SELLER",
        },
      });
      console.log(`Added SELLER role to existing user: ${email}`);
    }
  }

  // Return fresh user with roles
  return await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });
}

async function createProduct(
  input: any,
  sellerId: string,
  categoryId: string
) {
  const slug = slugify(input.name);
  let uniqueSlug = slug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  // Convert specifications to specificationTable (JSON)
  const specTable = input.variants.specifications?.reduce((acc: any, spec: any) => {
    acc[spec.key] = spec.value;
    return acc;
  }, {}) || {};

  // Extract features from specifications or use empty array
  const features = input.variants.specifications?.map((spec: any) => `${spec.key}: ${spec.value}`) || [];

  return await prisma.$transaction(
    async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: input.name,
          slug: uniqueSlug,
          description: input.description || "",
          status: "INACTIVE",
          categoryId,
          brand: input.brand || "Generic",
          sellerId,
          features: features,
          specificationTable: specTable,
          variants: {
            create: {
              sku: input.variants.sku,
              price: input.variants.price,
              mrp: input.variants.mrp || input.variants.price,
              stock: input.variants.stock,
              attributes: input.variants.attributes || {},
              isDefault: input.variants.isDefault !== false,
              specificationTable: specTable,
              specifications:
                input.variants.specifications?.length > 0
                  ? {
                    create: input.variants.specifications.map((spec: any) => ({
                      key: spec.key,
                      value: spec.value,
                    })),
                  }
                  : undefined,
            },
          },
          images: {
            create: input.images.map((img: any, index: number) => ({
              url: img.url,
              altText: img.altText || null,
              sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
              mediaType: img.mediaType || "PRIMARY",
              fileType: img.fileType,
            })),
          },
        },
      });

      if (input.deliveryOptions?.length > 0) {
        await tx.deliveryOption.createMany({
          data: input.deliveryOptions.map((option: any) => ({
            productId: newProduct.id,
            title: option.title,
            description: option.description || null,
            isDefault: option.isDefault || false,
          })),
        });
      }

      if (input.warranty?.length > 0) {
        await tx.warranty.createMany({
          data: input.warranty.map((warranty: any) => ({
            productId: newProduct.id,
            type: warranty.type,
            duration: warranty.duration || null,
            unit: warranty.unit || null,
            description: warranty.description || null,
          })),
        });
      }

      if (input.returnPolicy?.length > 0) {
        await tx.returnPolicy.createMany({
          data: input.returnPolicy.map((policy: any) => ({
            productId: newProduct.id,
            type: policy.type,
            duration: policy.duration || null,
            unit: policy.unit || null,
            conditions: policy.conditions || null,
          })),
        });
      }

      return newProduct;
    },
    { timeout: 15000 }
  );
}

async function main() {
  const sellers = [
    await createOrGetSeller("seller1@test.com", "John", "Doe"),
    await createOrGetSeller("seller2@test.com", "Jane", "Smith"),
    await createOrGetSeller("seller3@test.com", "Mike", "Johnson"),
  ];

  const productsData = [
    // Fashion 1: Nike Air Max 270
    {
      name: "Nike Air Max 270",
      description: "Lifestyle sneakers with Max Air unit for all-day comfort",
      brand: "Nike",
      categoryName: "Sports Shoes",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "NIKEAM270-001",
        price: 149.99,
        mrp: 179.99,
        stock: 75,
        attributes: { size: "10", color: "Black/White" },
        specifications: [
          { key: "Material", value: "Mesh and Synthetic" },
          { key: "Sole", value: "Rubber with Air Max" },
          { key: "Style", value: "Casual/Athletic" },
          { key: "Weight", value: "10.5 oz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          altText: "Nike Air Max 270",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 6,
          unit: "months",
          description: "Nike warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unworn with tags",
        },
      ],
    },

    // Fashion 2: Zara Oversized Blazer
    {
      name: "Zara Oversized Double-Breasted Blazer",
      description: "Trendy oversized blazer with padded shoulders",
      brand: "Zara",
      categoryName: "Blazers & Coats",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "ZARABLAZER-001",
        price: 89.99,
        mrp: 119.99,
        stock: 45,
        attributes: { size: "M", color: "Camel" },
        specifications: [
          { key: "Material", value: "80% Polyester, 20% Viscose" },
          { key: "Fit", value: "Oversized" },
          { key: "Closure", value: "Double-breasted" },
          { key: "Care", value: "Dry clean only" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1591369822096-e4d32ea9e663",
          altText: "Zara Oversized Blazer",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 15,
          unit: "days",
          conditions: "With tags attached",
        },
      ],
    },

    // Fashion 3: Lululemon Align Leggings
    {
      name: 'Lululemon Align High-Rise Pant 28"',
      description: "Buttery-soft yoga leggings with four-way stretch",
      brand: "Lululemon",
      categoryName: "Activewear",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "LULUALIGN-001",
        price: 128.0,
        mrp: 148.0,
        stock: 60,
        attributes: { size: "6", color: "True Navy" },
        specifications: [
          { key: "Material", value: "Nulu™ fabric" },
          { key: "Rise", value: "High-rise" },
          { key: "Inseam", value: "28 inches" },
          { key: "Features", value: "Hidden pocket" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8",
          altText: "Lululemon Align Leggings",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "3-5 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unworn condition",
        },
      ],
    },

    // Fashion 4: Ralph Lauren Polo Shirt
    {
      name: "Ralph Lauren Classic Fit Mesh Polo",
      description: "Iconic polo shirt with signature embroidered pony",
      brand: "Ralph Lauren",
      categoryName: "T-Shirts & Polos",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "RLPOLO-001",
        price: 89.99,
        mrp: 110.0,
        stock: 85,
        attributes: { size: "L", color: "Navy Blue" },
        specifications: [
          { key: "Material", value: "100% Cotton Mesh" },
          { key: "Fit", value: "Classic Fit" },
          { key: "Collar", value: "Ribbed Polo Collar" },
          { key: "Logo", value: "Embroidered Pony" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1625910513390-a1c597b2ad3f",
          altText: "Ralph Lauren Polo",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Original condition",
        },
      ],
    },

    // Fashion 5: H&M Floral Midi Dress
    {
      name: "H&M Floral Print Midi Dress",
      description: "Flowing midi dress with vintage floral pattern",
      brand: "H&M",
      categoryName: "Dresses & Gowns",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "HMDRESS-001",
        price: 39.99,
        mrp: 59.99,
        stock: 70,
        attributes: { size: "S", color: "Cream/Floral" },
        specifications: [
          { key: "Material", value: "100% Viscose" },
          { key: "Length", value: "Midi" },
          { key: "Sleeve", value: "Short puff sleeves" },
          { key: "Closure", value: "Concealed zip" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1572804013988-17f0e9bd6e0a",
          altText: "H&M Floral Dress",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 14,
          unit: "days",
          conditions: "With receipt",
        },
      ],
    },

    // Fashion 6: Adidas Ultraboost 22
    {
      name: "Adidas Ultraboost 22",
      description: "Premium running shoes with responsive Boost cushioning",
      brand: "Adidas",
      categoryName: "Sports Shoes",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "ADIDASUB22-001",
        price: 179.99,
        mrp: 210.0,
        stock: 50,
        attributes: { size: "9.5", color: "Core Black" },
        specifications: [
          { key: "Material", value: "Primeknit+ Upper" },
          { key: "Midsole", value: "Boost Technology" },
          { key: "Outsole", value: "Continental Rubber" },
          { key: "Weight", value: "11.3 oz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda",
          altText: "Adidas Ultraboost 22",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [
        { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn" },
      ],
    },

    // Fashion 7: Tommy Hilfiger Slim Fit Jeans
    {
      name: "Tommy Hilfiger Scanton Slim Jeans",
      description: "Classic slim fit jeans with signature flag logo",
      brand: "Tommy Hilfiger",
      categoryName: "Jeans & Trousers",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "THJEANS-001",
        price: 99.99,
        mrp: 129.99,
        stock: 65,
        attributes: { size: "32x32", color: "Dynamic True Dark" },
        specifications: [
          { key: "Material", value: "99% Cotton, 1% Elastane" },
          { key: "Fit", value: "Slim" },
          { key: "Rise", value: "Mid-rise" },
          { key: "Stretch", value: "Comfort Stretch" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
          altText: "Tommy Hilfiger Jeans",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unworn with tags",
        },
      ],
    },

    // Fashion 8: Calvin Klein Underwear Set
    {
      name: "Calvin Klein Modern Cotton Bralette & Brief Set",
      description: "Comfortable cotton underwear set with iconic waistband",
      brand: "Calvin Klein",
      categoryName: "Underwear & Loungewear",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "CKUNDER-001",
        price: 48.0,
        mrp: 65.0,
        stock: 90,
        attributes: { size: "M", color: "Black" },
        specifications: [
          { key: "Material", value: "53% Cotton, 35% Modal, 12% Elastane" },
          { key: "Style", value: "Bralette & Brief" },
          { key: "Band", value: "Logo Waistband" },
          { key: "Care", value: "Machine wash" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1570549667552-81fb9bc7b1a0",
          altText: "Calvin Klein Set",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Discreet Delivery",
          description: "3-5 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "NO_RETURN",
          duration: null,
          unit: null,
          conditions: "Hygiene product",
        },
      ],
    },

    // Fashion 9: The North Face Jacket
    {
      name: "The North Face 1996 Retro Nuptse Jacket",
      description: "Iconic puffer jacket with 700-fill goose down",
      brand: "The North Face",
      categoryName: "Blazers & Coats",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "TNFNUPTSE-001",
        price: 299.99,
        mrp: 350.0,
        stock: 35,
        attributes: { size: "L", color: "TNF Black" },
        specifications: [
          { key: "Insulation", value: "700-fill Goose Down" },
          { key: "Shell", value: "Ripstop Nylon" },
          { key: "Features", value: "DWR Finish" },
          { key: "Pockets", value: "2 Hand, 1 Chest" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1574719784146-3c1362b16073",
          altText: "North Face Nuptse",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "4-6 days",
          isDefault: true,
        },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "Limited lifetime",
        },
      ],
      returnPolicy: [
        { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn" },
      ],
    },

    // Fashion 10: Gucci Belt
    {
      name: "Gucci GG Marmont Leather Belt",
      description: "Luxury leather belt with Double G buckle",
      brand: "Gucci",
      categoryName: "Accessories",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "GUCCIBELT-001",
        price: 450.0,
        mrp: 520.0,
        stock: 20,
        attributes: { size: "90cm", color: "Black" },
        specifications: [
          { key: "Material", value: "100% Leather" },
          { key: "Buckle", value: "Antique Brass Double G" },
          { key: "Width", value: "3cm" },
          { key: "Made in", value: "Italy" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1590874103328-44c7c3f54d9f",
          altText: "Gucci Belt",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Luxury Express", description: "1-2 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 24,
          unit: "months",
          description: "Authenticity guaranteed",
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 14,
          unit: "days",
          conditions: "With authenticity card",
        },
      ],
    },

    // Fashion 11: Uniqlo Heattech Ultra Warm
    {
      name: "Uniqlo Heattech Ultra Warm Crew Neck Long Sleeve",
      description: "Advanced thermal underwear with heat retention technology",
      brand: "Uniqlo",
      categoryName: "Underwear & Loungewear",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "UNIQLOHT-001",
        price: 29.9,
        mrp: 39.9,
        stock: 120,
        attributes: { size: "M", color: "Dark Gray" },
        specifications: [
          {
            key: "Material",
            value: "38% Acrylic, 32% Rayon, 21% Polyester, 9% Spandex",
          },
          { key: "Technology", value: "Heattech Ultra Warm" },
          { key: "Thickness", value: "1.5x Regular" },
          { key: "Features", value: "Moisture-wicking" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
          altText: "Uniqlo Heattech",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unworn with tags",
        },
      ],
    },

    // Fashion 12: Patagonia Fleece
    {
      name: "Patagonia Better Sweater Fleece Jacket",
      description: "Sustainable fleece jacket made from recycled polyester",
      brand: "Patagonia",
      categoryName: "Blazers & Coats",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "PATAFLEECE-001",
        price: 139.0,
        mrp: 159.0,
        stock: 40,
        attributes: { size: "M", color: "New Navy" },
        specifications: [
          { key: "Material", value: "100% Recycled Polyester" },
          { key: "Weight", value: "448g" },
          { key: "Features", value: "Fair Trade Certified" },
          { key: "Pockets", value: "3 Zippered" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
          altText: "Patagonia Fleece",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Eco Delivery", description: "5-7 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "Ironclad guarantee",
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Any reason",
        },
      ],
    },

    // Fashion 13: Vans Old Skool
    {
      name: "Vans Old Skool Classic Skate Shoes",
      description: "Iconic low-top skate shoes with side stripe",
      brand: "Vans",
      categoryName: "Sports Shoes",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "VANSOLDS-001",
        price: 69.99,
        mrp: 85.0,
        stock: 95,
        attributes: { size: "10", color: "Black/White" },
        specifications: [
          { key: "Upper", value: "Canvas and Suede" },
          { key: "Sole", value: "Vulcanized Rubber" },
          { key: "Closure", value: "Lace-up" },
          { key: "Style", value: "Low-top" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
          altText: "Vans Old Skool",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn" },
      ],
    },

    // Fashion 14: Mango Leather Jacket
    {
      name: "Mango Genuine Leather Biker Jacket",
      description: "Classic biker jacket in soft lamb leather",
      brand: "Mango",
      categoryName: "Blazers & Coats",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "MANGOLEATH-001",
        price: 199.99,
        mrp: 299.99,
        stock: 25,
        attributes: { size: "S", color: "Black" },
        specifications: [
          { key: "Material", value: "100% Lamb Leather" },
          { key: "Lining", value: "100% Polyester" },
          { key: "Style", value: "Biker" },
          { key: "Hardware", value: "Silver-tone zips" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1551028719-00167b16eac5",
          altText: "Mango Leather Jacket",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      returnPolicy: [
        { type: "REFUND", duration: 15, unit: "days", conditions: "With tags" },
      ],
    },

    // Fashion 15: Champion Reverse Weave Hoodie
    {
      name: "Champion Reverse Weave Pullover Hoodie",
      description: "Heavyweight fleece hoodie with embroidered logo",
      brand: "Champion",
      categoryName: "Hoodies & Sweatshirts",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "CHAMPHOODIE-001",
        price: 59.99,
        mrp: 75.0,
        stock: 80,
        attributes: { size: "L", color: "Oxford Gray" },
        specifications: [
          { key: "Material", value: "82% Cotton, 18% Polyester" },
          { key: "Weight", value: "12 oz Fleece" },
          { key: "Technology", value: "Reverse Weave" },
          { key: "Logo", value: "Embroidered C" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
          altText: "Champion Hoodie",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn" },
      ],
    },

    // Fashion 16: Puma Training Shorts
    {
      name: "Puma DryCELL Training Shorts",
      description: "Moisture-wicking athletic shorts for intense workouts",
      brand: "Puma",
      categoryName: "Activewear",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "PUMASHORTS-001",
        price: 34.99,
        mrp: 45.0,
        stock: 100,
        attributes: { size: "M", color: "Puma Black" },
        specifications: [
          { key: "Material", value: "100% Polyester" },
          { key: "Technology", value: "DryCELL" },
          { key: "Inseam", value: "9 inches" },
          { key: "Pockets", value: "Side zip pocket" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b",
          altText: "Puma Training Shorts",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unworn with tags",
        },
      ],
    },

    // Fashion 17: Diesel Distressed Jeans
    {
      name: "Diesel D-Strukt Distressed Slim Jeans",
      description: "Premium Italian denim with authentic distressing",
      brand: "Diesel",
      categoryName: "Jeans & Trousers",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "DIESELJEANS-001",
        price: 178.0,
        mrp: 228.0,
        stock: 30,
        attributes: { size: "31x32", color: "Medium Blue" },
        specifications: [
          { key: "Material", value: "99% Cotton, 1% Elastane" },
          { key: "Fit", value: "Slim" },
          { key: "Wash", value: "Destroyed" },
          { key: "Made in", value: "Italy" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1582552938422-478c8ca03888",
          altText: "Diesel Jeans",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      returnPolicy: [
        { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn" },
      ],
    },

    // Fashion 18: Under Armour Compression Shirt
    {
      name: "Under Armour HeatGear Compression Long Sleeve",
      description: "Ultra-tight second skin fit for maximum support",
      brand: "Under Armour",
      categoryName: "Activewear",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "UACOMP-001",
        price: 44.99,
        mrp: 55.0,
        stock: 70,
        attributes: { size: "L", color: "White" },
        specifications: [
          { key: "Material", value: "84% Polyester, 16% Elastane" },
          { key: "Fit", value: "Compression" },
          { key: "Technology", value: "HeatGear" },
          { key: "UPF", value: "30+" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5",
          altText: "UA Compression Shirt",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "4-6 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn" },
      ],
    },

    // Fashion 19: Converse Chuck Taylor All Star
    {
      name: "Converse Chuck Taylor All Star High Top",
      description: "Classic canvas high-top sneakers since 1917",
      brand: "Converse",
      categoryName: "Sports Shoes",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "CONVCHUCK-001",
        price: 59.99,
        mrp: 70.0,
        stock: 110,
        attributes: { size: "9", color: "Optical White" },
        specifications: [
          { key: "Upper", value: "Canvas" },
          { key: "Sole", value: "Vulcanized Rubber" },
          { key: "Style", value: "High-top" },
          { key: "Closure", value: "Lace-up" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6",
          altText: "Converse High Top",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn" },
      ],
    },

    // Fashion 20: Fila Disruptor II
    {
      name: "Fila Disruptor II Premium Sneakers",
      description: "Chunky retro sneakers with premium leather upper",
      brand: "Fila",
      categoryName: "Sports Shoes",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "FILADISR-001",
        price: 74.99,
        mrp: 90.0,
        stock: 65,
        attributes: { size: "8", color: "White/Navy/Red" },
        specifications: [
          { key: "Upper", value: "Leather and Synthetic" },
          { key: "Platform", value: "1.5 inches" },
          { key: "Style", value: "Chunky" },
          { key: "Logo", value: "Embroidered" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1608231387982-09b8045796b3",
          altText: "Fila Disruptor",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unworn with box",
        },
      ],
    },

    // Fashion 21: Superdry Winter Parka
    {
      name: "Superdry Everest Parka",
      description: "Heavy-duty parka with faux fur hood trim",
      brand: "Superdry",
      categoryName: "Blazers & Coats",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "SDPARKA-001",
        price: 179.99,
        mrp: 249.99,
        stock: 28,
        attributes: { size: "L", color: "Dark Khaki" },
        specifications: [
          { key: "Shell", value: "100% Polyester" },
          { key: "Insulation", value: "90% Duck Down, 10% Feathers" },
          { key: "Hood", value: "Detachable Faux Fur" },
          { key: "Features", value: "8 Pockets" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1548883354-7f45d30adcb8",
          altText: "Superdry Parka",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [
        { type: "REFUND", duration: 30, unit: "days", conditions: "With tags" },
      ],
    },

    // Fashion 22: Forever 21 Crop Top
    {
      name: "Forever 21 Ribbed Knit Crop Top",
      description: "Trendy ribbed crop top perfect for layering",
      brand: "Forever 21",
      categoryName: "T-Shirts & Polos",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "F21CROP-001",
        price: 12.99,
        mrp: 19.99,
        stock: 150,
        attributes: { size: "S", color: "Heather Gray" },
        specifications: [
          { key: "Material", value: "95% Cotton, 5% Spandex" },
          { key: "Fit", value: "Fitted" },
          { key: "Length", value: "Cropped" },
          { key: "Neckline", value: "Crew neck" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1594633312646-a042041ccea2",
          altText: "Forever 21 Crop Top",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 21,
          unit: "days",
          conditions: "With receipt",
        },
      ],
    },

    // Fashion 23: Balenciaga Triple S Sneakers
    {
      name: "Balenciaga Triple S Trainers",
      description: "Luxury triple-stacked sole sneakers",
      brand: "Balenciaga",
      categoryName: "Sports Shoes",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "BALTRIPLES-001",
        price: 975.0,
        mrp: 1150.0,
        stock: 10,
        attributes: { size: "42", color: "Black/Red" },
        specifications: [
          { key: "Upper", value: "Mesh and Leather" },
          { key: "Sole", value: "Triple-stacked" },
          { key: "Height", value: "6cm platform" },
          { key: "Made in", value: "Italy" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1608646314584-1f66ad34f3d5",
          altText: "Balenciaga Triple S",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Luxury Express", description: "1-2 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 24,
          unit: "months",
          description: "Authenticity guaranteed",
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 14,
          unit: "days",
          conditions: "Unworn with all packaging",
        },
      ],
    },

    // Fashion 24: American Eagle Flannel Shirt
    {
      name: "American Eagle Plaid Flannel Shirt",
      description: "Soft brushed cotton flannel in classic plaid",
      brand: "American Eagle",
      categoryName: "T-Shirts & Polos",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "AEFLANNEL-001",
        price: 39.95,
        mrp: 54.95,
        stock: 75,
        attributes: { size: "M", color: "Red/Navy Plaid" },
        specifications: [
          { key: "Material", value: "100% Cotton Flannel" },
          { key: "Fit", value: "Relaxed" },
          { key: "Pattern", value: "Buffalo Plaid" },
          { key: "Pockets", value: "Chest pocket" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1598032494313-e581cf0e88f9",
          altText: "AE Flannel Shirt",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 60,
          unit: "days",
          conditions: "Any condition",
        },
      ],
    },

    // Fashion 25: Columbia Hiking Boots
    {
      name: "Columbia Newton Ridge Plus Waterproof Hiking Boots",
      description: "Durable waterproof boots for all-terrain hiking",
      brand: "Columbia",
      categoryName: "Sports Shoes",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "COLBOOTS-001",
        price: 89.99,
        mrp: 110.0,
        stock: 45,
        attributes: { size: "10.5", color: "Cordovan/Squash" },
        specifications: [
          { key: "Upper", value: "Leather and Mesh" },
          { key: "Technology", value: "Omni-Tech Waterproof" },
          { key: "Outsole", value: "Omni-Grip Rubber" },
          { key: "Support", value: "TechLite Midsole" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1478827227954-745b0daf2534",
          altText: "Columbia Hiking Boots",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "4-6 days",
          isDefault: true,
        },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "Waterproof guarantee",
        },
      ],
      returnPolicy: [
        { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn" },
      ],
    },

    // Fashion 26: Allbirds Tree Runners
    {
      name: "Allbirds Tree Runners",
      description: "Sustainable shoes made from eucalyptus tree fiber",
      brand: "Allbirds",
      categoryName: "Sports Shoes",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "ALLBTREE-001",
        price: 98.0,
        mrp: 115.0,
        stock: 55,
        attributes: { size: "9", color: "Kauri Marine Blue" },
        specifications: [
          { key: "Upper", value: "Eucalyptus Tree Fiber" },
          { key: "Sole", value: "SweetFoam (Sugarcane)" },
          { key: "Insole", value: "Merino Wool" },
          { key: "Sustainability", value: "Carbon Neutral" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1539185441755-2f8e7f0d8f3c",
          altText: "Allbirds Tree Runners",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Eco Delivery", description: "5-7 days", isDefault: true },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Any reason",
        },
      ],
    },

    // Fashion 27: Versace Chain Print Shirt
    {
      name: "Versace Baroque Chain Print Silk Shirt",
      description: "Luxury silk shirt with signature baroque print",
      brand: "Versace",
      categoryName: "T-Shirts & Polos",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "VERSACESHIRT-001",
        price: 895.0,
        mrp: 1095.0,
        stock: 8,
        attributes: { size: "50", color: "Gold/Black" },
        specifications: [
          { key: "Material", value: "100% Silk" },
          { key: "Pattern", value: "Baroque Chain" },
          { key: "Fit", value: "Regular" },
          { key: "Made in", value: "Italy" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1598030025034-52c50df8fb64",
          altText: "Versace Shirt",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Luxury Express", description: "1-2 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "Authenticity certificate",
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 14,
          unit: "days",
          conditions: "With all tags and packaging",
        },
      ],
    },

    // Fashion 28: Reebok Classic Leather
    {
      name: "Reebok Classic Leather Legacy",
      description: "Retro-inspired sneakers with premium leather",
      brand: "Reebok",
      categoryName: "Sports Shoes",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "REEBOKCLASS-001",
        price: 89.99,
        mrp: 110.0,
        stock: 72,
        attributes: { size: "11", color: "Chalk/Classic White" },
        specifications: [
          { key: "Upper", value: "Full-grain Leather" },
          { key: "Midsole", value: "EVA Foam" },
          { key: "Outsole", value: "Rubber" },
          { key: "Heritage", value: "Since 1983" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1539787724936-641f0f66bbf3",
          altText: "Reebok Classic",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unworn with box",
        },
      ],
    },

    // Fashion 29: Shein Bodycon Dress
    {
      name: "SHEIN Ribbed Knit Bodycon Mini Dress",
      description: "Trendy ribbed mini dress with cutout detail",
      brand: "SHEIN",
      categoryName: "Dresses & Gowns",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "SHEINDRESS-001",
        price: 18.99,
        mrp: 29.99,
        stock: 200,
        attributes: { size: "M", color: "Dusty Pink" },
        specifications: [
          { key: "Material", value: "95% Polyester, 5% Spandex" },
          { key: "Length", value: "Mini" },
          { key: "Fit", value: "Bodycon" },
          { key: "Features", value: "Cutout Detail" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
          altText: "SHEIN Bodycon Dress",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "7-10 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 15,
          unit: "days",
          conditions: "Unworn with tags",
        },
      ],
    },

    // Fashion 30: Timberland 6-Inch Boots
    {
      name: "Timberland 6-Inch Premium Waterproof Boots",
      description: "Icon 6-inch boots with premium waterproof leather",
      brand: "Timberland",
      categoryName: "Sports Shoes",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "TIMB6INCH-001",
        price: 198.0,
        mrp: 230.0,
        stock: 38,
        attributes: { size: "10", color: "Wheat Nubuck" },
        specifications: [
          { key: "Upper", value: "Premium Waterproof Leather" },
          { key: "Collar", value: "Padded Leather" },
          { key: "Outsole", value: "Rubber Lug" },
          { key: "Construction", value: "Seam-sealed" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1605812830455-2faea6cb6c1f",
          altText: "Timberland 6-Inch Boots",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "Waterproof warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unworn with box",
        },
      ],
    },
  ];

  let createdCount = 0;
  for (const productData of productsData) {
    try {
      const seller = await createOrGetSeller(productData.sellerEmail, "", "");
      if (!seller) {
        console.warn(`⚠️ Seller not found for product "${productData.name}" — skipping`);
        continue;
      }
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { name: productData.categoryName },
            { name: { contains: productData.categoryName, mode: 'insensitive' } }
          ]
        },
      });

      if (!category) {
        console.warn(
          `⚠️ Category "${productData.categoryName}" not found — skipping "${productData.name}"`
        );
        continue;
      }

      const product = await createProduct(productData, seller.id, category.id);
      console.log(`✅ Created product: ${product.name}`);
      createdCount++;
    } catch (error: any) {
      console.error(`❌ Error creating "${productData.name}":`, error.message);
    }
  }

  console.log(`\n🎉 Seeding complete! Created ${createdCount} products.`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
