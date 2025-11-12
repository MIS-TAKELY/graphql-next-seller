import {
  ADD_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
} from "@/client/product/product.mutations";
import { GET_MY_PRODUCTS } from "@/client/product/product.queries";
import { ICreateProductInput, Media } from "@/types/pages/product";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface ProductImage {
  url: string;
}

export interface ProductVariant {
  price: number;
  sku: string;
  stock: number;
}

export interface Product {
  category: {
    __typename: string;
    id: string;
    name: string;
    children: any[];
  } | null;
  id: string;
  images: ProductImage[];
  name: string;
  slug: string;
  status: string;
  variants: ProductVariant[];
  brand?: string;
  description?: string;
}

export interface GetMyProductsData {
  getMyProducts: {
    __typename: string;
    products: Product[];
    percentChange: number;
  };
}

export const useProduct = () => {
  const router = useRouter();
  const client = useApolloClient();

  const {
    data: productsData,
    loading: productsDataLoading,
    error: productsDataError,
  } = useQuery(GET_MY_PRODUCTS, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
    fetchPolicy: "cache-first",
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const productId = variables?.productId;
        if (!productId) return;

        const existing: GetMyProductsData | null = cache.readQuery({
          query: GET_MY_PRODUCTS,
        });

        if (!existing?.getMyProducts) return;

        const updatedProducts = existing.getMyProducts.products.filter(
          (p) => p.id !== productId
        );

        cache.writeQuery({
          query: GET_MY_PRODUCTS,
          data: {
            getMyProducts: {
              __typename: "getMyProductsResponse",
              products: updatedProducts,
              percentChange: existing.getMyProducts.percentChange ?? 0,
            },
          },
        });
      } catch (error) {
        console.error("Error updating cache for delete:", error);
      }
    },
    optimisticResponse: (vars) => ({
      deleteProduct: true,
    }),
    onError: (error) => {
      toast.error("Failed to delete product. Changes reverted.");
    },
  });

  const [addProduct] = useMutation(ADD_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const actualInput: ICreateProductInput = variables?.input;
        if (!actualInput) return;

        const existing: GetMyProductsData | null = cache.readQuery({
          query: GET_MY_PRODUCTS,
        });

        if (!existing?.getMyProducts) return;

        const tempId = "temp-" + Date.now();

        const slug = actualInput.name
          ? actualInput.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          : "temp-product";

        const variant = actualInput.variants
          ? {
              __typename: "ProductVariant",
              ...actualInput.variants,
            }
          : null;

        // ✅ Get category with name field from existing data or don't include it
        const existingCategory = existing.getMyProducts.products.find(
          (p) => p.category?.id === actualInput.categoryId
        )?.category;

        const optimisticProduct: Product = {
          id: tempId,
          name: actualInput.name,
          slug,
          description: actualInput.description || "",
          brand: actualInput.brand || "",
          category: existingCategory || null,
          images:
            actualInput.images?.map((img, index) => ({
              __typename: "ProductImage",
              url: img.url,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? index,
              mediaType: img.mediaType || "PRIMARY",
            })) || [],
          variants: variant ? [variant] : [],
          status: "DRAFT",
        };

        const productExists = existing.getMyProducts.products.some(
          (p) => p.id === optimisticProduct.id
        );

        if (!productExists) {
          cache.writeQuery({
            query: GET_MY_PRODUCTS,
            data: {
              getMyProducts: {
                __typename: "getMyProductsResponse",
                products: [
                  ...existing.getMyProducts.products,
                  optimisticProduct,
                ],
                percentChange: existing.getMyProducts.percentChange ?? 0,
              },
            },
          });
        }
      } catch (error) {
        console.error("Error updating cache for add:", error);
      }
    },
    optimisticResponse: (vars) => {
      const input = vars?.input;
      const tempId = "temp-" + Date.now();
      const slug = input?.name
        ? input.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : "temp-product";

      return {
        addProduct: {
          __typename: "Product",
          id: tempId,
          name: input?.name || "",
          slug,
          description: input?.description || "",
          brand: input?.brand || "",
          category: null,
          images:
            input?.images?.map((img: Media, index: number) => ({
              __typename: "ProductImage",
              url: img.url,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? index,
              mediaType: img.mediaType || "PRIMARY",
            })) || [],
          variants: input?.variants
            ? [
                {
                  __typename: "ProductVariant",
                  ...input.variants,
                },
              ]
            : [],
          status: "DRAFT",
        },
      };
    },
    onError: (error) => {
      toast.error("Failed to create product. Please try again.");
      router.push("/products"); // Stay on products page
    },
  });

  const handleSubmitHandler = async (productInput: ICreateProductInput) => {
    try {
      if (!productInput.name) throw new Error("Product name is required");
      if (!productInput.images || productInput.images.length === 0)
        throw new Error("At least one image is required");
      if (!productInput.variants?.sku)
        throw new Error("Product variant SKU is required");

      // ✅ Show immediate feedback
      toast.success("Creating product...");
      router.push("/products"); // ✅ Navigate immediately

      // Mutation happens in background
      addProduct({
        variables: { input: productInput },
      });
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(
        error.message || "Failed to create product. Please try again."
      );
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      if (!productId) throw new Error("Product ID is required");

      // ✅ Show immediate feedback
      toast.success("Deleting product...");

      // Mutation happens with optimistic response
      deleteProduct({
        variables: { productId },
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(
        error.message || "Failed to delete product. Please try again."
      );
    }
  };

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const actualInput: any = variables?.input;
        if (!actualInput?.id) return;

        const existing: GetMyProductsData | null = cache.readQuery({
          query: GET_MY_PRODUCTS,
        });

        if (!existing?.getMyProducts) return;

        // ✅ Get existing category with name field
        const existingCategory = existing.getMyProducts.products.find(
          (p) => p.category?.id === actualInput.categoryId
        )?.category;

        const updatedProducts = existing.getMyProducts.products.map((p) => {
          if (p.id !== actualInput.id) return p;

          const variant = actualInput.variants
            ? {
                __typename: "ProductVariant",
                ...actualInput.variants,
              }
            : null;

          return {
            ...p,
            name: actualInput.name ?? p.name,
            description: actualInput.description ?? p.description,
            brand: actualInput.brand ?? p.brand,
            category: actualInput.categoryId
              ? existingCategory || p.category
              : p.category,
            images:
              actualInput.images?.map((img: Media, index: number) => ({
                __typename: "ProductImage",
                url: img.url,
                altText: img.altText || null,
                sortOrder: img.sortOrder ?? index,
                mediaType: img.mediaType || "PRIMARY",
              })) || p.images,
            variants: variant ? [variant] : p.variants,
          };
        });

        cache.writeQuery({
          query: GET_MY_PRODUCTS,
          data: {
            getMyProducts: {
              __typename: "getMyProductsResponse",
              products: updatedProducts,
              percentChange: existing.getMyProducts.percentChange ?? 0,
            },
          },
        });
      } catch (error) {
        console.error("Error updating cache for update:", error);
      }
    },
    optimisticResponse: (vars) => {
      const input = vars?.input;
      
      return {
        updateProduct: {
          __typename: "Product",
          id: input?.id || "",
          name: input?.name || "",
          slug: input?.name
            ? input.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
            : "",
          description: input?.description || "",
          brand: input?.brand || "",
          category: null, // Will be merged from cache
          images:
            input?.images?.map((img: Media, index: number) => ({
              __typename: "ProductImage",
              url: img.url,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? index,
              mediaType: img.mediaType || "PRIMARY",
            })) || [],
          variants: input?.variants
            ? [
                {
                  __typename: "ProductVariant",
                  ...input.variants,
                },
              ]
            : [],
          status: "ACTIVE",
        },
      };
    },
    onError: (error) => {
      toast.error("Failed to update product. Changes reverted.");
      router.push("/products"); // Navigate back on error
    },
  });

  const handleUpdateHandler = async (
    productInput: ICreateProductInput & { id: string }
  ) => {
    try {
      if (!productInput.id) throw new Error("Product ID is required");

      // ✅ Show immediate feedback
      toast.success("Updating product...");
      router.push("/products"); // ✅ Navigate immediately

      // Mutation happens in background
      updateProduct({
        variables: { input: productInput },
      });
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(
        error.message || "Failed to update product. Please try again."
      );
    }
  };

  return {
    handleSubmitHandler,
    handleDelete,
    productsData,
    productsDataLoading,
    productsDataError,
    handleUpdateHandler,
  };
};