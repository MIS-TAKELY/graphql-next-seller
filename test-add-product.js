const testAddProduct = async () => {
    const mutation = `
    mutation AddProduct($input: CreateProductInput!) {
      addProduct(input: $input)
    }
  `;

    const variables = {
        input: {
            name: "Test Product",
            description: "Test Description",
            categoryId: "cmjig7gwx005xddeedfgj6t0t",
            brand: "Test Brand",
            status: "INACTIVE",
            specificationTable: {
                headers: ["Specification", "Value"],
                rows: [["Test Spec", "Test Value"]]
            },
            variants: [
                {
                    sku: "TEST-SKU-001",
                    price: 100,
                    mrp: 150,
                    stock: 10,
                    attributes: { color: "red" },
                    isDefault: true
                }
            ],
            images: [
                {
                    url: "https://res.cloudinary.com/dzvq7ccgr/image/upload/v1766565131/kl8pr6wfzzrykq3a2b3g.png",
                    altText: "Test Image",
                    fileType: "IMAGE",
                    mediaType: "PRIMARY"
                }
            ],
            deliveryOptions: [
                {
                    title: "Standard Delivery",
                    description: "3-5 Business Days",
                    isDefault: true
                }
            ]
        }
    };

    try {
        const response = await fetch('http://localhost:3001/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed
            },
            body: JSON.stringify({
                query: mutation,
                variables: variables,
                operationName: 'AddProduct'
            })
        });

        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));

        if (result.errors) {
            console.error('❌ Mutation failed with errors:', result.errors);
            process.exit(1);
        } else if (result.data?.addProduct === true) {
            console.log('✅ Product created successfully!');
            process.exit(0);
        } else {
            console.log('⚠️ Unexpected response:', result);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Request failed:', error);
        process.exit(1);
    }
};

testAddProduct();
