// hooks/product/useProduct.ts
import {
  ADD_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
} from "@/client/product/product.mutations";
import { GET_MY_PRODUCTS } from "@/client/product/product.queries";
import {
  GetMyProductsResponse,
  ICreateProductInput,
  Product,
} from "@/types/pages/product";
import type { ProductVariant } from "@/types/product/product.types";
import { ProductStatus } from "@/types/common/enums";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const slugifyProductName = (value?: string, fallback = "temp-product") =>
  value
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") || fallback;

type OptimisticProductOptions = Partial<
  Pick<Product, "id" | "category" | "sellerId" | "status">
>;

// Helper to map API Input -> UI Product Type for Optimistic Updates
const buildOptimisticProduct = (
  input: ICreateProductInput,
  options: OptimisticProductOptions = {}
): Product => {
  const timestamp = Date.now();
  const productId = options.id ?? `temp-${timestamp}`;

  return {
    id: productId,
    createdAt: new Date(),
    updatedAt: new Date(),
    sellerId: options.sellerId ?? "temp-seller",
    name: input.name ?? "",
    slug: slugifyProductName(input.name),
    description: input.description ?? "",
    status: options.status ?? ProductStatus.INACTIVE,
    brand: input.brand ?? "",
    categoryId: input.categoryId,
    category: options.category ?? null,
    images: (input.images ?? []).map((img, index) => ({
      id: `${productId}-image-${index}`,
      productId,
      variantId: null,
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder ?? index,
      mediaType: img.mediaType ?? "PRIMARY",
      fileType: img.fileType ?? "IMAGE",
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    // UPDATED: Handle Array of Variants
    variants: input.variants.map((v, index) => ({
      id: v.id || `${productId}-variant-${index}`,
      productId,
      sku: v.sku,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      soldCount: 0, // Default for new items
      attributes: v.attributes,
      isDefault: v.isDefault ?? index === 0,
      specifications: v.specifications?.map((spec, specIndex) => ({
        id: `${productId}-variant-${index}-spec-${specIndex}`,
        variantId: v.id || `${productId}-variant-${index}`,
        key: spec.key,
        value: spec.value,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    deliveryOptions: (input.deliveryOptions ?? []).map((option, index) => ({
      id: `${productId}-delivery-${index}`,
      productId,
      title: option.title,
      description: option.description,
      isDefault: option.isDefault ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    warranty: (input.warranty ?? []).map((item, index) => ({
      id: `${productId}-warranty-${index}`,
      productId,
      type: item.type,
      duration: item.duration,
      unit: item.unit,
      description: item.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    returnPolicy: (input.returnPolicy ?? []).map((policy, index) => ({
      id: `${productId}-return-${index}`,
      productId,
      type: policy.type,
      duration: policy.duration,
      unit: policy.unit,
      conditions: policy.conditions,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    productOffers: (input.productOffers ?? []).map((offer, index) => ({
      id: `${productId}-offer-${index}`,
      offerId: `${productId}-offer-${index}`,
      productId,
      offer: {
        id: `${productId}-offer-${index}`,
        title: offer.offer.title,
        description: offer.offer.description,
        type: offer.offer.type,
        value: offer.offer.value,
        startDate: offer.offer.startDate,
        endDate: offer.offer.endDate,
        isActive: offer.offer.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
};

export const useProduct = () => {
  const router = useRouter();

  const {
    data: productsData,
    loading: productsDataLoading,
    error: productsDataError,
  } = useQuery<GetMyProductsResponse>(GET_MY_PRODUCTS, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
    fetchPolicy: "cache-first",
  });

  // --- DELETE MUTATION ---
  const [deleteProduct] = useMutation<
    { deleteProduct: boolean },
    { productId: string }
  >(DELETE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const productId = variables?.productId;
        if (!productId) return;
        const existing = cache.readQuery<GetMyProductsResponse>({
          query: GET_MY_PRODUCTS,
        });
        if (!existing?.getMyProducts) return;
        const updatedProducts = existing.getMyProducts.products.filter(
          (p: Product) => p.id !== productId
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
    optimisticResponse: () => ({
      deleteProduct: true,
    }),
    onError: () => {
      toast.error("Failed to delete product. Changes reverted.");
    },
  });

  // --- ADD MUTATION ---
  const [addProduct] = useMutation<
    { addProduct: Product },
    { input: ICreateProductInput }
  >(ADD_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const actualInput = variables?.input;
        if (!actualInput) return;
        const existing = cache.readQuery<GetMyProductsResponse>({
          query: GET_MY_PRODUCTS,
        });
        if (!existing?.getMyProducts) return;

        const tempId = "temp-" + Date.now();
        // Try to find category object from existing cache to prevent UI flicker
        const existingCategory = existing.getMyProducts.products.find(
          (p: Product) => p.category?.id === actualInput.categoryId
        )?.category;

        const optimisticProduct = buildOptimisticProduct(actualInput, {
          id: tempId,
          category: existingCategory ?? undefined, // Fixed type mismatch (null vs undefined)
          sellerId:
            existing.getMyProducts.products[0]?.sellerId ??
            productsData?.getMyProducts.products[0]?.sellerId ??
            "temp-seller",
          status: ProductStatus.INACTIVE, // Default status
        });

        cache.writeQuery({
          query: GET_MY_PRODUCTS,
          data: {
            getMyProducts: {
              __typename: "getMyProductsResponse",
              products: [...existing.getMyProducts.products, optimisticProduct],
              percentChange: existing.getMyProducts.percentChange ?? 0,
            },
          },
        });
      } catch (error) {
        console.error("Error updating cache for add:", error);
      }
    },
    optimisticResponse: (vars: { input: ICreateProductInput }) => ({
      addProduct: buildOptimisticProduct(vars.input),
    }),
    onError: () => {
      toast.error("Failed to create product. Please try again.");
      router.push("/products");
    },
  });

  // --- UPDATE MUTATION ---
  const [updateProduct] = useMutation<
    { updateProduct: Product },
    { input: ICreateProductInput & { id: string } }
  >(UPDATE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const actualInput = variables?.input;
        if (!actualInput?.id) return;
        const existing = cache.readQuery<GetMyProductsResponse>({
          query: GET_MY_PRODUCTS,
        });
        if (!existing?.getMyProducts) return;

        const existingCategory = existing.getMyProducts.products.find(
          (p: Product) => p.category?.id === actualInput.categoryId
        )?.category;

        const updatedProducts = existing.getMyProducts.products.map((p: Product) => {
          if (p.id !== actualInput.id) return p;

          // Construct updated variants safely
          const updatedVariants: ProductVariant[] = actualInput.variants
            ? actualInput.variants.map((v, idx) => ({
                id: v.id || `${p.id}-variant-new-${idx}`,
                productId: p.id,
                sku: v.sku,
                price: v.price,
                mrp: v.mrp,
                stock: v.stock,
                soldCount: 0, // Maintain existing sold count if possible, or 0
                attributes: v.attributes,
                isDefault: v.isDefault ?? false,
                specifications: v.specifications?.map((s, si) => ({
                  id: `temp-spec-${si}`,
                  variantId: v.id || `${p.id}-variant-new-${idx}`,
                  key: s.key,
                  value: s.value,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })),
                createdAt: new Date(),
                updatedAt: new Date(),
              }))
            : p.variants;

          return {
            ...p,
            name: actualInput.name ?? p.name,
            description: actualInput.description ?? p.description,
            brand: actualInput.brand ?? p.brand,
            category: actualInput.categoryId
              ? existingCategory || p.category
              : p.category,
            images:
              actualInput.images?.map((img, index) => ({
                id: `temp-img-${index}`,
                productId: p.id,
                url: img.url,
                altText: img.altText,
                sortOrder: img.sortOrder ?? index,
                mediaType: img.mediaType || "PRIMARY",
                fileType: img.fileType,
              })) || p.images,
            variants: updatedVariants,
            // Simple status check: if all variants have 0 stock
            status: updatedVariants.every((v) => v.stock === 0)
              ? ProductStatus.INACTIVE
              : actualInput.status || p.status,
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
    optimisticResponse: (vars: { input: ICreateProductInput & { id: string } }) => ({
      updateProduct: buildOptimisticProduct(vars.input, {
        id: vars.input.id,
        status: vars.input.status,
      }),
    }),
    onError: () => {
      toast.error("Failed to update product. Changes reverted.");
      router.push("/products");
    },
  });

  // --- HANDLERS ---

  const handleSubmitHandler = async (productInput: ICreateProductInput) => {
    try {
      if (!productInput.name) throw new Error("Product name is required");

      if (!productInput.images || productInput.images.length === 0)
        throw new Error("At least one image is required");

      // UPDATED: Validation for Array of Variants
      if (!productInput.variants || productInput.variants.length === 0) {
        throw new Error("At least one product variant is required");
      }

      toast.success("Creating product...");
      router.push("/products");
      await addProduct({ variables: { input: productInput } });
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create product. Please try again."
      );
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      if (!productId) throw new Error("Product ID is required");
      toast.success("Deleting product...");
      await deleteProduct({ variables: { productId } });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete product. Please try again."
      );
    }
  };

  const handleUpdateHandler = async (
    productInput: ICreateProductInput & { id: string }
  ) => {
    try {
      if (!productInput.id) throw new Error("Product ID is required");

      // UPDATED: Validation for Array of Variants
      if (productInput.variants && productInput.variants.length === 0) {
        throw new Error("Cannot update product with empty variants");
      }

      toast.success("Updating product...");
      router.push("/products");
      await updateProduct({ variables: { input: productInput } });
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product. Please try again."
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
