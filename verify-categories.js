const VERIFY_URL = 'http://localhost:3000/api/graphql'; // Adjusted port if needed, assuming default 3000 for next app

const query = `
query GetProductCategories {
  categories {
    id
    name
    parentId
    children {
      id
      name
      parentId
      children {
        id
        name
        parentId
      }
    }
  }
}
`;

async function verify() {
    console.log("🚀 Testing Categories query...");
    try {
        const response = await fetch(VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const result = await response.json();

        if (result.errors) {
            console.error("❌ Query Failed with Errors:");
            console.error(JSON.stringify(result.errors, null, 2));
            process.exit(1);
        } else {
            const categories = result.data.categories;
            console.log(`✅ Received ${categories.length} main categories.`);

            const subcategoriesInMain = categories.filter(c => c.parentId !== null);
            if (subcategoriesInMain.length > 0) {
                console.error("❌ FAILED: Found categories with parentId in the main list:");
                console.error(JSON.stringify(subcategoriesInMain, null, 2));
                process.exit(1);
            } else {
                console.log("✅ SUCCESS: All returned main categories have parentId: null.");
            }

            // Check if they have children as expected
            const catsWithChildren = categories.filter(c => c.children.length > 0);
            console.log(`📊 ${catsWithChildren.length} categories have children.`);

            process.exit(0);
        }
    } catch (error) {
        console.error("❌ Network or Server Error during verification:", error);
        process.exit(1);
    }
}

verify();
