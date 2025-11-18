// hooks/product/useProduct.ts
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ADD_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
} from "@/client/product/product.mutations";
import { GET_MY_PRODUCTS } from "@/client/product/product.queries";
import { ICreateProductInput, GetMyProductsResponse, Product } from "@/types/pages/product";

const slugifyProductName = (value?: string, fallback = "temp-product") =>
  value
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") || fallback;

type OptimisticProductOptions = Partial<
  Pick<Product, "id" | "category" | "sellerId" | "status">
>;

const buildOptimisticProduct = (
  input: ICreateProductInput,
  options: OptimisticProductOptions = {}
): Product => {
  const timestamp = Date.now();
  const productId = options.id ?? `temp-${timestamp}`;
  const variantInput = input.variants;
  const baseVariantId = `${productId}-variant`;

  return {
    id: productId,
    sellerId: options.sellerId ?? "temp-seller",
    name: input.name ?? "",
    slug: slugifyProductName(input.name),
    description: input.description ?? "",
    status: options.status ?? "DRAFT",
    brand: input.brand ?? "",
    categoryId: input.categoryId,
    category: options.category ?? null,
    images: (input.images ?? []).map((img, index) => ({
      id: `${productId}-image-${index}`,
      productId,
      variantId: undefined,
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder ?? index,
      mediaType: img.mediaType ?? "PRIMARY",
      fileType: img.fileType ?? "IMAGE",
    })),
    variants: [
      {
        id: baseVariantId,
        productId,
        sku: variantInput.sku,
        price: variantInput.price,
        mrp: variantInput.mrp,
        stock: variantInput.stock,
        soldCount: variantInput.soldCount ?? 0,
        attributes: variantInput.attributes,
        isDefault: variantInput.isDefault ?? true,
        specifications: variantInput.specifications?.map((spec, specIndex) => ({
          id: `${baseVariantId}-spec-${specIndex}`,
          key: spec.key,
          value: spec.value,
        })),
      },
    ],
    deliveryOptions: (input.deliveryOptions ?? []).map((option, index) => ({
      id: `${productId}-delivery-${index}`,
      title: option.title,
      description: option.description,
      isDefault: option.isDefault,
    })),
    warranty: (input.warranty ?? []).map((item, index) => ({
      id: `${productId}-warranty-${index}`,
      type: item.type,
      duration: item.duration,
      unit: item.unit,
      description: item.description,
    })),
    returnPolicy: (input.returnPolicy ?? []).map((policy, index) => ({
      id: `${productId}-return-${index}`,
      type: policy.type,
      duration: policy.duration,
      unit: policy.unit,
      conditions: policy.conditions,
    })),
    productOffers: (input.productOffers ?? []).map((offer, index) => ({
      id: `${productId}-offer-${index}`,
      offerId: `${productId}-offer-${index}`,
      offer: {
        id: `${productId}-offer-${index}`,
        title: offer.offer.title,
        description: offer.offer.description,
        type: offer.offer.type,
        value: offer.offer.value,
        startDate: offer.offer.startDate,
        endDate: offer.offer.endDate,
        isActive: offer.offer.isActive ?? true,
      },
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

  const [deleteProduct] = useMutation<{ deleteProduct: boolean }, { productId: string }>(
    DELETE_PRODUCT,
    {
      update: (cache, { data }, { variables }) => {
        try {
          const productId = variables?.productId;
          if (!productId) return;
          const existing = cache.readQuery<GetMyProductsResponse>({ query: GET_MY_PRODUCTS });
          if (!existing?.getMyProducts) return;
          const updatedProducts = existing.getMyProducts.products.filter((p) => p.id !== productId);
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
    }
  );

  const [addProduct] = useMutation<{ addProduct: Product }, { input: ICreateProductInput }>(
    ADD_PRODUCT,
    {
      update: (cache, { data }, { variables }) => {
        try {
          const actualInput = variables?.input;
          if (!actualInput) return;
          const existing = cache.readQuery<GetMyProductsResponse>({ query: GET_MY_PRODUCTS });
          if (!existing?.getMyProducts) return;
          const tempId = "temp-" + Date.now();
          const existingCategory = existing.getMyProducts.products.find(
            (p) => p.category?.id === actualInput.categoryId
          )?.category;
          const optimisticProduct = buildOptimisticProduct(actualInput, {
            id: tempId,
            category: existingCategory ?? null,
            sellerId:
              existing.getMyProducts.products[0]?.sellerId ??
              productsData?.getMyProducts.products[0]?.sellerId ??
              "temp-seller",
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
      optimisticResponse: (vars) => ({
        addProduct: buildOptimisticProduct(vars.input),
      }),
      onError: () => {
        toast.error("Failed to create product. Please try again.");
        router.push("/products");
      },
    }
  );

  const [updateProduct] = useMutation<
    { updateProduct: Product },
    { input: ICreateProductInput & { id: string } }
  >(UPDATE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const actualInput = variables?.input;
        if (!actualInput?.id) return;
        const existing = cache.readQuery<GetMyProductsResponse>({ query: GET_MY_PRODUCTS });
        if (!existing?.getMyProducts) return;
        const existingCategory = existing.getMyProducts.products.find(
          (p) => p.category?.id === actualInput.categoryId
        )?.category;
        const updatedProducts = existing.getMyProducts.products.map((p) => {
          if (p.id !== actualInput.id) return p;
          return {
            ...p,
            name: actualInput.name ?? p.name,
            description: actualInput.description ?? p.description,
            brand: actualInput.brand ?? p.brand,
            category: actualInput.categoryId ? existingCategory || p.category : p.category,
            images: actualInput.images?.map((img, index) => ({
              __typename: "ProductImage",
              url: img.url,
              altText: img.altText,
              sortOrder: img.sortOrder ?? index,
              mediaType: img.mediaType || "PRIMARY",
              fileType: img.fileType,
            })) || p.images,
            variants: actualInput.variants ? [actualInput.variants] : p.variants,
            status: actualInput.variants?.stock === 0 ? "DISCONTINUED" : "ACTIVE",
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
    optimisticResponse: (vars) => ({
      updateProduct: buildOptimisticProduct(vars.input, {
        id: vars.input.id,
        status: vars.input.variants.stock === 0 ? "DISCONTINUED" : "ACTIVE",
      }),
    }),
    onError: () => {
      toast.error("Failed to update product. Changes reverted.");
      router.push("/products");
    },
  });

  const handleSubmitHandler = async (productInput: ICreateProductInput) => {
    try {
      if (!productInput.name) throw new Error("Product name is required");
      if (!productInput.images || productInput.images.length === 0)
        throw new Error("At least one image is required");
      if (!productInput.variants?.sku)
        throw new Error("Product variant SKU is required");
      toast.success("Creating product...");
      router.push("/products");
      await addProduct({ variables: { input: productInput } });
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create product. Please try again."
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
        error instanceof Error ? error.message : "Failed to delete product. Please try again."
      );
    }
  };

  const handleUpdateHandler = async (productInput: ICreateProductInput & { id: string }) => {
    try {
      if (!productInput.id) throw new Error("Product ID is required");
      toast.success("Updating product...");
      router.push("/products");
      await updateProduct({ variables: { input: productInput } });
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update product. Please try again."
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