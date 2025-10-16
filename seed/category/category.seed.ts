// require { PrismaClient } from "../../app/generated/prisma";
const { PrismaClient } = require("../../app/generated/prisma");

const prisma = new PrismaClient(); // Fixed: No destructuring needed; PrismaClient is the instance.

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function createCategory(
  name: string,
  parentId?: string,
  description?: string
) {
  // Make idempotent: check if exists by name (unique), return existing if so
  const existing = await prisma.category.findUnique({
    where: { name },
  });
  if (existing) {
    return existing;
  }
  return prisma.category.create({
    data: {
      name,
      slug: slugify(name),
      parentId,
      description,
      isActive: true, // Explicitly set for clarity, though default is true.
    },
  });
}

async function main() {
  // 1. Electronics
  const electronics = await createCategory("Electronics");

  const mobiles = await createCategory("Mobile & Accessories", electronics.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Smartphones",
        slug: slugify("Smartphones"),
        parentId: mobiles.id,
        isActive: true,
      },
      {
        name: "Feature Phones",
        slug: slugify("Feature Phones"),
        parentId: mobiles.id,
        isActive: true,
      },
      {
        name: "Mobile Cases & Covers",
        slug: slugify("Mobile Cases & Covers"),
        parentId: mobiles.id,
        isActive: true,
      },
      {
        name: "Screen Protectors",
        slug: slugify("Screen Protectors"),
        parentId: mobiles.id,
        isActive: true,
      },
      {
        name: "Power Banks",
        slug: slugify("Power Banks"),
        parentId: mobiles.id,
        isActive: true,
      },
      {
        name: "Chargers & Cables",
        slug: slugify("Chargers & Cables"),
        parentId: mobiles.id,
        isActive: true,
      },
      {
        name: "Mobile Holders & Stands",
        slug: slugify("Mobile Holders & Stands"),
        parentId: mobiles.id,
        isActive: true,
      },
      {
        name: "Bluetooth Headsets",
        slug: slugify("Bluetooth Headsets"),
        parentId: mobiles.id,
        isActive: true,
      },
      {
        name: "Smartwatches & Wearables",
        slug: slugify("Smartwatches & Wearables"),
        parentId: mobiles.id,
        isActive: true,
      },
    ],
    skipDuplicates: true, // Skip if any unique constraint (e.g., name or slug) would fail
  });

  const computers = await createCategory("Computers & Laptops", electronics.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Laptops",
        slug: slugify("Laptops"),
        parentId: computers.id,
        isActive: true,
      },
      {
        name: "Desktops",
        slug: slugify("Desktops"),
        parentId: computers.id,
        isActive: true,
      },
      {
        name: "Monitors",
        slug: slugify("Monitors"),
        parentId: computers.id,
        isActive: true,
      },
      {
        name: "Keyboards & Mice",
        slug: slugify("Keyboards & Mice"),
        parentId: computers.id,
        isActive: true,
      },
      {
        name: "Printers & Scanners",
        slug: slugify("Printers & Scanners"),
        parentId: computers.id,
        isActive: true,
      },
      {
        name: "Storage Devices (HDD, SSD, USB)",
        slug: slugify("Storage Devices (HDD, SSD, USB)"), // Fixed: Use full name for better slug (e.g., storage-devices-hdd-ssd-usb)
        parentId: computers.id,
        isActive: true,
      },
      {
        name: "Networking (Routers, Modems)",
        slug: slugify("Networking (Routers, Modems)"), // Fixed: Full name (e.g., networking-routers-modems)
        parentId: computers.id,
        isActive: true,
      },
      {
        name: "Laptop Bags & Sleeves",
        slug: slugify("Laptop Bags & Sleeves"),
        parentId: computers.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const tv = await createCategory("TVs & Home Entertainment", electronics.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Smart TVs",
        slug: slugify("Smart TVs"),
        parentId: tv.id,
        isActive: true,
      },
      {
        name: "LED/LCD TVs",
        slug: slugify("LED/LCD TVs"),
        parentId: tv.id,
        isActive: true,
      }, // Fixed: Keep / in slugify (becomes led-lcd-tvs)
      {
        name: "Home Theater Systems",
        slug: slugify("Home Theater Systems"),
        parentId: tv.id,
        isActive: true,
      },
      {
        name: "Soundbars",
        slug: slugify("Soundbars"),
        parentId: tv.id,
        isActive: true,
      },
      {
        name: "Streaming Devices (Fire Stick, Roku)",
        slug: slugify("Streaming Devices (Fire Stick, Roku)"), // Fixed: Full name (e.g., streaming-devices-fire-stick-roku)
        parentId: tv.id,
        isActive: true,
      },
      {
        name: "TV Mounts & Stands",
        slug: slugify("TV Mounts & Stands"),
        parentId: tv.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const cameras = await createCategory("Cameras & Photography", electronics.id);
  await prisma.category.createMany({
    data: [
      {
        name: "DSLR & Mirrorless Cameras",
        slug: slugify("DSLR & Mirrorless Cameras"),
        parentId: cameras.id,
        isActive: true,
      },
      {
        name: "Action Cameras",
        slug: slugify("Action Cameras"),
        parentId: cameras.id,
        isActive: true,
      },
      {
        name: "Camera Lenses",
        slug: slugify("Camera Lenses"),
        parentId: cameras.id,
        isActive: true,
      },
      {
        name: "Tripods & Stands",
        slug: slugify("Tripods & Stands"),
        parentId: cameras.id,
        isActive: true,
      },
      {
        name: "Memory Cards",
        slug: slugify("Memory Cards"),
        parentId: cameras.id,
        isActive: true,
      },
      {
        name: "Camera Bags",
        slug: slugify("Camera Bags"),
        parentId: cameras.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const audio = await createCategory("Audio & Headphones", electronics.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Wireless Earbuds",
        slug: slugify("Wireless Earbuds"),
        parentId: audio.id,
        isActive: true,
      },
      {
        name: "OverEar Headphones",
        slug: slugify("OverEar Headphones"),
        parentId: audio.id,
        isActive: true,
      },
      {
        name: "Earphones",
        slug: slugify("Earphones"),
        parentId: audio.id,
        isActive: true,
      },
      {
        name: "Speakers (Bluetooth, Smart)",
        slug: slugify("Speakers (Bluetooth, Smart)"), // Fixed: Full name (e.g., speakers-bluetooth-smart)
        parentId: audio.id,
        isActive: true,
      },
      {
        name: "Sound Systems",
        slug: slugify("Sound Systems"),
        parentId: audio.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const gaming = await createCategory("Gaming", electronics.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Gaming Consoles (PS5, Xbox, Nintendo)",
        slug: slugify("Gaming Consoles (PS5, Xbox, Nintendo)"), // Fixed: Full name (e.g., gaming-consoles-ps5-xbox-nintendo)
        parentId: gaming.id,
        isActive: true,
      },
      {
        name: "Gaming Laptops & PCs",
        slug: slugify("Gaming Laptops & PCs"),
        parentId: gaming.id,
        isActive: true,
      },
      {
        name: "Gaming Accessories (Controllers, Keyboards)",
        slug: slugify("Gaming Accessories (Controllers, Keyboards)"), // Fixed: Full name (e.g., gaming-accessories-controllers-keyboards)
        parentId: gaming.id,
        isActive: true,
      },
      {
        name: "VR Headsets",
        slug: slugify("VR Headsets"),
        parentId: gaming.id,
        isActive: true,
      },
      {
        name: "Game CDs & Digital Codes",
        slug: slugify("Game CDs & Digital Codes"),
        parentId: gaming.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 2. Fashion & Apparel
  const fashion = await createCategory("Fashion & Apparel");
  const mens = await createCategory("Men’s Fashion", fashion.id);
  await prisma.category.createMany({
    data: [
      {
        name: "TShirts & Polos",
        slug: slugify("TShirts & Polos"),
        parentId: mens.id,
        isActive: true,
      },
      {
        name: "Shirts",
        slug: slugify("Shirts"),
        parentId: mens.id,
        isActive: true,
      },
      {
        name: "Jeans & Trousers",
        slug: slugify("Jeans & Trousers"),
        parentId: mens.id,
        isActive: true,
      },
      {
        name: "Ethnic Wear (Kurta, Sherwani)",
        slug: slugify("Ethnic Wear (Kurta, Sherwani)"), // Fixed: Full name (e.g., ethnic-wear-kurta-sherwani)
        parentId: mens.id,
        isActive: true,
      },
      {
        name: "Suits & Blazers",
        slug: slugify("Suits & Blazers"),
        parentId: mens.id,
        isActive: true,
      },
      {
        name: "Innerwear & Sleepwear",
        slug: slugify("Innerwear & Sleepwear"),
        parentId: mens.id,
        isActive: true,
      },
      {
        name: "Watches & Accessories",
        slug: slugify("Watches & Accessories"),
        parentId: mens.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const womens = await createCategory("Women’s Fashion", fashion.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Tops & Tees",
        slug: slugify("Tops & Tees"),
        parentId: womens.id,
        isActive: true,
      },
      {
        name: "Dresses & Gowns",
        slug: slugify("Dresses & Gowns"),
        parentId: womens.id,
        isActive: true,
      },
      {
        name: "Sarees & Ethnic Wear",
        slug: slugify("Sarees & Ethnic Wear"),
        parentId: womens.id,
        isActive: true,
      },
      {
        name: "Jeans & Leggings",
        slug: slugify("Jeans & Leggings"),
        parentId: womens.id,
        isActive: true,
      },
      {
        name: "Lingerie & Sleepwear",
        slug: slugify("Lingerie & Sleepwear"),
        parentId: womens.id,
        isActive: true,
      },
      {
        name: "Handbags & Clutches",
        slug: slugify("Handbags & Clutches"),
        parentId: womens.id,
        isActive: true,
      },
      {
        name: "Jewelry & Accessories",
        slug: slugify("Jewelry & Accessories"),
        parentId: womens.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const kids = await createCategory("Kids & Infant Wear", fashion.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Boys Clothing",
        slug: slugify("Boys Clothing"),
        parentId: kids.id,
        isActive: true,
      },
      {
        name: "Girls’ Clothing",
        slug: slugify("Girls’ Clothing"), // Fixed: Include apostrophe handling if needed, but regex removes it (girls-clothing)
        parentId: kids.id,
        isActive: true,
      },
      {
        name: "Baby Care (Diapers, Wipes)",
        slug: slugify("Baby Care (Diapers, Wipes)"), // Fixed: Full name (e.g., baby-care-diapers-wipes)
        parentId: kids.id,
        isActive: true,
      },
      {
        name: "Kids’ Footwear",
        slug: slugify("Kids’ Footwear"), // Fixed: (kids-footwear)
        parentId: kids.id,
        isActive: true,
      },
      {
        name: "Toys & Games",
        slug: slugify("Toys & Games"),
        parentId: kids.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const footwear = await createCategory("Footwear", fashion.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Sports Shoes",
        slug: slugify("Sports Shoes"),
        parentId: footwear.id,
        isActive: true,
      },
      {
        name: "Casual Shoes",
        slug: slugify("Casual Shoes"),
        parentId: footwear.id,
        isActive: true,
      },
      {
        name: "Sandals & FlipFlops",
        slug: slugify("Sandals & FlipFlops"),
        parentId: footwear.id,
        isActive: true,
      },
      {
        name: "Formal Shoes",
        slug: slugify("Formal Shoes"),
        parentId: footwear.id,
        isActive: true,
      },
      {
        name: "Sneakers",
        slug: slugify("Sneakers"),
        parentId: footwear.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const watches = await createCategory("Watches & Jewelry", fashion.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Men’s Watches",
        slug: slugify("Men’s Watches"), // Fixed: (mens-watches)
        parentId: watches.id,
        isActive: true,
      },
      {
        name: "Women’s Watches",
        slug: slugify("Women’s Watches"), // Fixed: (womens-watches)
        parentId: watches.id,
        isActive: true,
      },
      {
        name: "Rings, Necklaces, Earrings",
        slug: slugify("Rings, Necklaces, Earrings"),
        parentId: watches.id,
        isActive: true,
      },
      {
        name: "Luxury & Designer Jewelry",
        slug: slugify("Luxury & Designer Jewelry"),
        parentId: watches.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 3. Home & Kitchen
  const home = await createCategory("Home & Kitchen");
  const furniture = await createCategory("Furniture", home.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Sofas & Couches",
        slug: slugify("Sofas & Couches"),
        parentId: furniture.id,
        isActive: true,
      },
      {
        name: "Beds & Mattresses",
        slug: slugify("Beds & Mattresses"),
        parentId: furniture.id,
        isActive: true,
      },
      {
        name: "Dining Tables & Chairs",
        slug: slugify("Dining Tables & Chairs"),
        parentId: furniture.id,
        isActive: true,
      },
      {
        name: "Wardrobes & Storage",
        slug: slugify("Wardrobes & Storage"),
        parentId: furniture.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const kitchen = await createCategory("Kitchen Appliances", home.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Mixer Grinders",
        slug: slugify("Mixer Grinders"),
        parentId: kitchen.id,
        isActive: true,
      },
      {
        name: "Air Fryers",
        slug: slugify("Air Fryers"),
        parentId: kitchen.id,
        isActive: true,
      },
      {
        name: "Microwave Ovens",
        slug: slugify("Microwave Ovens"),
        parentId: kitchen.id,
        isActive: true,
      },
      {
        name: "Refrigerators",
        slug: slugify("Refrigerators"),
        parentId: kitchen.id,
        isActive: true,
      },
      {
        name: "Coffee Makers",
        slug: slugify("Coffee Makers"),
        parentId: kitchen.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const decor = await createCategory("Home Decor", home.id);
  await prisma.category.createMany({
    data: [
      {
        name: "Wall Art & Paintings",
        slug: slugify("Wall Art & Paintings"),
        parentId: decor.id,
        isActive: true,
      },
      {
        name: "Clocks",
        slug: slugify("Clocks"),
        parentId: decor.id,
        isActive: true,
      },
      {
        name: "Candles & Fragrances",
        slug: slugify("Candles & Fragrances"),
        parentId: decor.id,
        isActive: true,
      },
      {
        name: "Flower Vases",
        slug: slugify("Flower Vases"),
        parentId: decor.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const cookware = await createCategory("Cookware & Dining", home.id);
  await prisma.category.createMany({
    data: [
      {
        name: "NonStick Pans",
        slug: slugify("NonStick Pans"),
        parentId: cookware.id,
        isActive: true,
      },
      {
        name: "Pressure Cookers",
        slug: slugify("Pressure Cookers"),
        parentId: cookware.id,
        isActive: true,
      },
      {
        name: "Cutlery Sets",
        slug: slugify("Cutlery Sets"),
        parentId: cookware.id,
        isActive: true,
      },
      {
        name: "Dinner Sets",
        slug: slugify("Dinner Sets"),
        parentId: cookware.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const lighting = await createCategory("Lighting", home.id);
  await prisma.category.createMany({
    data: [
      {
        name: "LED Bulbs",
        slug: slugify("LED Bulbs"),
        parentId: lighting.id,
        isActive: true,
      },
      {
        name: "Table Lamps",
        slug: slugify("Table Lamps"),
        parentId: lighting.id,
        isActive: true,
      },
      {
        name: "Decorative Lights",
        slug: slugify("Decorative Lights"),
        parentId: lighting.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 4. Grocery & Gourmet
  const grocery = await createCategory("Grocery & Gourmet");
  await prisma.category.createMany({
    data: [
      {
        name: "Snacks & Beverages",
        slug: slugify("Snacks & Beverages"),
        parentId: grocery.id,
        isActive: true,
      },
      {
        name: "Dairy Products",
        slug: slugify("Dairy Products"),
        parentId: grocery.id,
        isActive: true,
      },
      {
        name: "Breakfast Cereals",
        slug: slugify("Breakfast Cereals"),
        parentId: grocery.id,
        isActive: true,
      },
      {
        name: "Organic & Healthy Foods",
        slug: slugify("Organic & Healthy Foods"),
        parentId: grocery.id,
        isActive: true,
      },
      {
        name: "Tea & Coffee",
        slug: slugify("Tea & Coffee"),
        parentId: grocery.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 5. Beauty & Personal Care
  const beauty = await createCategory("Beauty & Personal Care");
  await prisma.category.createMany({
    data: [
      {
        name: "Skincare (Face Wash, Creams)",
        slug: slugify("Skincare (Face Wash, Creams)"), // Fixed: Full name (e.g., skincare-face-wash-creams)
        parentId: beauty.id,
        isActive: true,
      },
      {
        name: "Haircare (Shampoo, Conditioners)",
        slug: slugify("Haircare (Shampoo, Conditioners)"), // Fixed: (haircare-shampoo-conditioners)
        parentId: beauty.id,
        isActive: true,
      },
      {
        name: "Makeup (Lipstick, Foundation)",
        slug: slugify("Makeup (Lipstick, Foundation)"), // Fixed: (makeup-lipstick-foundation)
        parentId: beauty.id,
        isActive: true,
      },
      {
        name: "Perfumes & Deodorants",
        slug: slugify("Perfumes & Deodorants"),
        parentId: beauty.id,
        isActive: true,
      },
      {
        name: "Men’s Grooming (Razors, Beard Care)",
        slug: slugify("Men’s Grooming (Razors, Beard Care)"), // Fixed: Full name (e.g., mens-grooming-razors-beard-care)
        parentId: beauty.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 6. Health & Wellness
  const health = await createCategory("Health & Wellness");
  await prisma.category.createMany({
    data: [
      {
        name: "Vitamins & Supplements",
        slug: slugify("Vitamins & Supplements"),
        parentId: health.id,
        isActive: true,
      },
      {
        name: "Fitness Equipment (Yoga Mats, Dumbbells)",
        slug: slugify("Fitness Equipment (Yoga Mats, Dumbbells)"), // Fixed: Full name (e.g., fitness-equipment-yoga-mats-dumbbells)
        parentId: health.id,
        isActive: true,
      },
      {
        name: "Medical Supplies (BP Monitors, Thermometers)",
        slug: slugify("Medical Supplies (BP Monitors, Thermometers)"), // Fixed: Full name (e.g., medical-supplies-bp-monitors-thermometers)
        parentId: health.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 7. Books & Stationery
  const books = await createCategory("Books & Stationery");
  await prisma.category.createMany({
    data: [
      {
        name: "Fiction & NonFiction Books",
        slug: slugify("Fiction & NonFiction Books"),
        parentId: books.id,
        isActive: true,
      },
      {
        name: "Educational Textbooks",
        slug: slugify("Educational Textbooks"),
        parentId: books.id,
        isActive: true,
      },
      {
        name: "Office Stationery",
        slug: slugify("Office Stationery"),
        parentId: books.id,
        isActive: true,
      },
      {
        name: "Pens & Notebooks",
        slug: slugify("Pens & Notebooks"),
        parentId: books.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 8. Toys & Games
  const toys = await createCategory("Toys & Games");
  await prisma.category.createMany({
    data: [
      {
        name: "Action Figures",
        slug: slugify("Action Figures"),
        parentId: toys.id,
        isActive: true,
      },
      {
        name: "Board Games",
        slug: slugify("Board Games"),
        parentId: toys.id,
        isActive: true,
      },
      {
        name: "Remote Control Toys",
        slug: slugify("Remote Control Toys"),
        parentId: toys.id,
        isActive: true,
      },
      {
        name: "Educational Toys",
        slug: slugify("Educational Toys"),
        parentId: toys.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 9. Automotive & Tools
  const auto = await createCategory("Automotive & Tools");
  await prisma.category.createMany({
    data: [
      {
        name: "Car Accessories",
        slug: slugify("Car Accessories"),
        parentId: auto.id,
        isActive: true,
      },
      {
        name: "Bike Accessories",
        slug: slugify("Bike Accessories"),
        parentId: auto.id,
        isActive: true,
      },
      {
        name: "Tools & Hardware",
        slug: slugify("Tools & Hardware"),
        parentId: auto.id,
        isActive: true,
      },
      {
        name: "Automotive Care",
        slug: slugify("Automotive Care"),
        parentId: auto.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 10. Sports & Outdoors
  const sports = await createCategory("Sports & Outdoors");
  await prisma.category.createMany({
    data: [
      {
        name: "Gym Equipment",
        slug: slugify("Gym Equipment"),
        parentId: sports.id,
        isActive: true,
      },
      {
        name: "Cricket, Football, Badminton Gear",
        slug: slugify("Cricket, Football, Badminton Gear"),
        parentId: sports.id,
        isActive: true,
      },
      {
        name: "Camping & Hiking Gear",
        slug: slugify("Camping & Hiking Gear"),
        parentId: sports.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ All categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
