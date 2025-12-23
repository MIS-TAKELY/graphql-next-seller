import { prisma } from "@/lib/db/prisma";

const categories = [
    "Accessories", "Action Figures", "Activewear", "Air Fryers", "Bakeware", "Bath", "Bedding",
    "Beverages", "Blazers", "Blazers & Coats", "Body Care", "Boys Clothing", "Camera Lenses",
    "Car Accessories", "Casual Shoes", "Condiments", "Cookware", "Cutlery", "Dinnerware",
    "Dresses & Gowns", "Ethnic Wear", "Fiction & Non-Fiction Books", "Formal Shoes", "Fragrances",
    "Gaming Accessories", "Gaming Consoles", "Glassware", "Grains & Cereals", "Gym Equipment",
    "Haircare", "Hair Removal", "Hair Tools", "Home Decor", "Hoodies & Sweatshirts", "Jackets & Coats",
    "Jeans & Trousers", "Kitchen Appliances", "Laptops", "Makeup", "Men's Grooming", "Mixer Grinders",
    "Monitors", "Oral Care", "Pantry Staples", "Power Banks", "Refrigerators", "Shirts", "Skincare",
    "Smartphones", "Smart TVs", "Smartwatches & Wearables", "Snacks", "Snacks & Beverages",
    "Sofas & Couches", "Speakers", "Specialty Foods", "Sports Shoes", "Spreads", "Suits", "Sweaters",
    "Sweatshirts & Hoodies", "Sweeteners", "Table Linens", "T-Shirts & Polos", "Underwear & Loungewear",
    "Vitamins & Supplements", "Wall Art & Paintings", "Wireless Earbuds"
];

async function main() {
    console.log("Seeding categories...");
    for (const name of categories) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: {
                name,
                slug,
                description: `${name} category`,
            },
        });
    }
    console.log("Categories seeded successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
