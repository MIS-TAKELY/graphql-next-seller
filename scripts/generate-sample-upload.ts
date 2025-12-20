import * as xlsx from "xlsx";
import path from "path";

const OUTPUT_PATH = path.join(process.cwd(), "sample_products.xlsx");

const data = [
    {
        name: "Classic Cotton T-Shirt",
        sku: "TSHIRT-BLK-M",
        price: 25.99,
        stock: 100,
        brand: "FashionBrand",
        description: "Premium cotton t-shirt in black.",
    },
    {
        name: "Slim Fit Jeans",
        sku: "JEANS-BLU-32",
        price: 49.50,
        stock: 50,
        brand: "DenimCo",
        description: "Comfortable slim fit jeans.",
    },
    {
        name: "Wireless Earbuds",
        sku: "TECH-BUDS-01",
        price: 89.99,
        stock: 200,
        brand: "AudioTech",
        description: "Noise cancelling wireless earbuds.",
    },
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Products");

xlsx.writeFile(wb, OUTPUT_PATH);
console.log(`Sample file created at: ${OUTPUT_PATH}`);
