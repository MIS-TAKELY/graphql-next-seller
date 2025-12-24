const VERIFY_URL = 'http://localhost:3001/api/graphql';

const updateProductMutation = `
mutation UpdateProduct($input: UpdateProductInput!) {
  updateProduct(input: $input)
}
`;

const productId = "cmjjrwwwu00025tzulshm71np"; // From user's error report

const variables = {
    input: {
        id: productId,
        name: "test edited",
        description: "test edited",
        brand: "test",
        categoryId: "cmjig7gpl001kddeepljvm51c",
        status: "INACTIVE",
        variants: [
            {
                sku: "GREEN",
                price: 20,
                mrp: 200,
                stock: 34,
                attributes: { colour: "green" },
                isDefault: true
            },
            {
                sku: "RED",
                price: 10,
                mrp: 100,
                stock: 324,
                attributes: { colour: "red" }
            },
            {
                sku: "BLUE",
                price: 30,
                mrp: 300,
                stock: 0,
                attributes: { colour: "blue" }
            }
        ],
        images: [
            { url: "https://res.cloudinary.com/dzvq7ccgr/image/upload/v1766575299/rpqgesnw6ryjk8028tal.svg", fileType: "IMAGE" }
        ],
        deliveryOptions: [
            { title: "Standard Delivery", description: "3-5 Business Days", isDefault: true }
        ],
        specificationTable: {
            headers: ["Specification", "Value"],
            rows: [["laptpo", "laptop"]]
        }
    }
};

async function verify() {
    console.log("🚀 Testing Product Update with potential SKU conflict...");
    try {
        const response = await fetch(VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: updateProductMutation,
                variables,
                operationName: "UpdateProduct"
            })
        });

        const result = await response.json();

        if (result.errors) {
            console.error("❌ Verification Failed with Errors:");
            console.error(JSON.stringify(result.errors, null, 2));
            process.exit(1);
        } else {
            console.log("✅ Verification Successful! Product updated without SKU conflicts.");
            console.log("Data:", result.data);
            process.exit(0);
        }
    } catch (error) {
        console.error("❌ Network or Server Error during verification:", error);
        process.exit(1);
    }
}

verify();
