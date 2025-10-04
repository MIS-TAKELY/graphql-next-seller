// export const useProduct = () => {
//   const router = useRouter();

//   const {
//     data: productsData,
//     loading: productsDataLoading,
//     error: productsDataError,
//   } = useQuery(GET_MY_PRODUCTS, {
//     errorPolicy: "all",
//     notifyOnNetworkStatusChange: false,
//     fetchPolicy: "cache-first",
//   });

//   const [deleteProduct] = useMutation(DELETE_PRODUCT, {
//     update: (cache, { data }, { variables }) => {
//       try {
//         const productId = variables?.productId;
//         if (!productId) return;

//         const existing: GetMyProductsData | null = cache.readQuery({
//           query: GET_MY_PRODUCTS,
//         });

//         const updatedProducts = (existing?.getMyProducts || []).filter(
//           (p) => p.id !== productId
//         );

//         cache.writeQuery({
//           query: GET_MY_PRODUCTS,
//           data: { getMyProducts: updatedProducts },
//         });
//       } catch (error) {
//         console.error("Error updating cache for delete:", error);
//       }
//     },
//     optimisticResponse: (vars) => ({
//       deleteProduct: true,
//     }),
//   });

//   const [addProduct] = useMutation(ADD_PRODUCT, {
//     update: (cache, { data }, { variables }) => {
//       try {
//         const actualInput: ICreateProductInput = variables?.input;
//         if (!actualInput) return;

//         const existing: GetMyProductsData | null = cache.readQuery({
//           query: GET_MY_PRODUCTS,
//         });

//         const tempId = "temp-" + Date.now();

//         const slug = actualInput.name
//           ? actualInput.name
//               .toLowerCase()
//               .replace(/\s+/g, "-")
//               .replace(/[^a-z0-9-]/g, "")
//           : "temp-product";

//         const variant = actualInput.variants
//           ? {
//               __typename: "ProductVariant",
//               ...actualInput.variants,
//             }
//           : null;

//         const optimisticProduct: Product = {
//           __typename: "Product",
//           id: tempId,
//           name: actualInput.name,
//           slug,
//           description: actualInput.description || "",
//           brand: actualInput.brand || "",
//           category: actualInput.categoryId
//             ? {
//                 __typename: "Category",
//                 id: actualInput.categoryId,
//                 parent: null,
//                 children: [],
//               }
//             : null,
//           images:
//             actualInput.images?.map((img, index) => ({
//               __typename: "ProductImage",
//               url: img.url,
//               altText: img.altText || null,
//               sortOrder: img.sortOrder ?? index,
//               mediaType: img.mediaType || "PRIMARY",
//             })) || [],
//           variants: variant ? [variant] : [],
//           status: "DRAFT",
//         };

//         const productExists = existing?.getMyProducts?.some(
//           (p) => p.id === optimisticProduct.id
//         );

//         if (!productExists) {
//           cache.writeQuery({
//             query: GET_MY_PRODUCTS,
//             data: {
//               getMyProducts: [
//                 ...(existing?.getMyProducts || []),
//                 optimisticProduct,
//               ],
//             },
//           });
//         }
//       } catch (error) {
//         console.error("Error updating cache for add:", error);
//       }
//     },
//     optimisticResponse: (vars) => ({
//       addProduct: true,
//     }),
//   });

//   const [updateProduct] = useMutation(UPDATE_PRODUCT, {
//     update: (cache, { data }, { variables }) => {
//       try {
//         const actualInput: any = variables?.input;
//         if (!actualInput?.id) return;

//         const existing: GetMyProductsData | null = cache.readQuery({
//           query: GET_MY_PRODUCTS,
//         });

//         const updatedProducts = (existing?.getMyProducts || []).map(
//           (p) => {
//             if (p.id !== actualInput.id) return p;

//             const variant = actualInput.variants
//               ? {
//                   __typename: "ProductVariant",
//                   ...actualInput.variants,
//                 }
//               : null;

//             return {
//               ...p,
//               name: actualInput.name ?? p.name,
//               description: actualInput.description ?? p.description,
//               brand: actualInput.brand ?? p.brand,
//               category: actualInput.categoryId
//                 ? {
//                     __typename: "Category",
//                     id: actualInput.categoryId,
//                     parent: null,
//                     children: [],
//                   }
//                 : p.category,
//               images:
//                 actualInput.images?.map((img, index) => ({
//                   __typename: "ProductImage",
//                   url: img.url,
//                   altText: img.altText || null,
//                   sortOrder: img.sortOrder ?? index,
//                   mediaType: img.mediaType || "PRIMARY",
//                 })) || p.images,
//               variants: variant ? [variant] : p.variants,
//             };
//           }
//         );

//         cache.writeQuery({
//           query: GET_MY_PRODUCTS,
//           data: { getMyProducts: updatedProducts },
//         });
//       } catch (error) {
//         console.error("Error updating cache for update:", error);
//       }
//     },
//     optimisticResponse: (vars) => ({
//       updateProduct: true,
//     }),
//   });

//   const handleSubmitHandler = async (productInput: ICreateProductInput) => {
//     try {
//       if (!productInput.name) throw new Error("Product name is required");
//       if (!productInput.images || productInput.images.length === 0)
//         throw new Error("At least one image is required");
//       if (!productInput.variants?.sku)
//         throw new Error("Product variant SKU is required");

//       const mutationVariables = { input: productInput };

//       await addProduct({
//         variables: mutationVariables,
//       });

//       toast.success("Product has been created successfully!");
//       router.push("/products");
//     } catch (error: any) {
//       console.error("Error creating product:", error);
//       toast.error(
//         error.message || "Failed to create product. Please try again."
//       );
//     }
//   };

//   const handleUpdateHandler = async (productInput: ICreateProductInput & { id: string }) => {
//     try {
//       if (!productInput.id) throw new Error("Product ID is required");

//       await updateProduct({
//         variables: { input: productInput },
//       });

//       toast.success("Product has been updated successfully!");
//       router.push("/products");
//     } catch (error: any) {
//       console.error("Error updating product:", error);
//       toast.error(
//         error.message || "Failed to update product. Please try again."
//       );
//     }
//   };

//   const handleDelete = async (productId: string) => {
//     try {
//       if (!productId) throw new Error("Product ID is required");

//       await deleteProduct({
//         variables: { productId },
//       });

//       toast.success("Product has been deleted successfully!");
//     } catch (error: any) {
//       console.error("Error deleting product:", error);
//       toast.error(
//         error.message || "Failed to delete product. Please try again."
//       );
//     }
//   };

//   return {
//     handleSubmitHandler,
//     handleUpdateHandler,
//     handleDelete,
//     productsData,
//     productsDataLoading,
//     productsDataError,
//   };
// };
