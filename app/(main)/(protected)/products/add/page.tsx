import AddProductClient from "@/components/pages/AddProductClient";

/**
 * AddProductPage
 * 
 * Strategy: Static Site Generation (SSG).
 * The page shell is static. Data (categories) is fetched client-side 
 * in AddProductClient for better responsiveness and no server load.
 */
export default function AddProductPage() {
  return <AddProductClient />;
}

