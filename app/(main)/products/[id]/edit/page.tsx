// "use client";

// import {
//   DELETE_PRODUCT,
//   UPDATE_PRODUCT,
// } from "@/client/product/product.mutations";
// import {
//   GET_PRODUCT,
//   GET_PRODUCT_CATEGORIES,
//   GET_PRODUCTS,
// } from "@/client/product/product.queries";
// import { FormNavigation } from "@/components/product/FormNavigation";
// import { ProgressStepper } from "@/components/product/ProgressStepper";
// import { BasicDetailsStep } from "@/components/product/steps/BasicDetailsStep";
// import { MediaStep } from "@/components/product/steps/MediaStep";
// import { PoliciesStep } from "@/components/product/steps/PoliciesStep";
// import { PricingStep } from "@/components/product/steps/PricingStep";
// import { ShippingStep } from "@/components/product/steps/ShippingStep";
// import { SpecificationsStep } from "@/components/product/steps/SpecificationsStep";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { FormData } from "@/types/pages/product";
// import { useMutation, useQuery } from "@apollo/client";
// import { ArrowLeft, Trash2 } from "lucide-react";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// // Define steps statically here instead of importing from config
// const steps = [
//   { id: 1, title: "Basic Details", description: "Product information" },
//   { id: 2, title: "Specifications", description: "Features and details" },
//   { id: 3, title: "Pricing & Inventory", description: "Price and stock" },
//   { id: 4, title: "Media Upload", description: "Images and videos" },
//   { id: 5, title: "Shipping", description: "Delivery options" },
//   { id: 6, title: "Policies", description: "Returns and warranty" },
// ];

// export default function EditProductPage() {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const params = useParams();

//   console.log("parms-->", params);

//   // GraphQL mutations and queries
//   const [
//     updateProduct,
//     { loading: updateProductLoading, error: updateProductError },
//   ] = useMutation(UPDATE_PRODUCT);

//   const [
//     deleteProduct,
//     { loading: deleteProductLoading, error: deleteProductError },
//   ] = useMutation(DELETE_PRODUCT, {
//     refetchQueries: [{ query: GET_PRODUCTS }],
//     awaitRefetchQueries: true,
//   });

//   const {
//     data: productData,
//     loading: productLoading,
//     error: productError,
//   } = useQuery(GET_PRODUCT, {
//     variables: { productId: params?.id },
//     errorPolicy: "all",
//     notifyOnNetworkStatusChange: false,
//   });

//   const {
//     data: getCategoryData,
//     loading: getCategoryLoading,
//     error: getCategoryError,
//   } = useQuery(GET_PRODUCT_CATEGORIES, {
//     errorPolicy: "all",
//     notifyOnNetworkStatusChange: false,
//   });

//   console.log("prosuct dara-->", productData);

//   const [formData, setFormData] = useState<FormData>({
//     // Basic Details
//     title: "",
//     description: "",
//     categoryId: "",
//     subcategory: "",
//     brandId: "",

//     // Specifications
//     features: [],
//     specifications: [],
//     specificationDisplayFormat: "bullet",

//     // Pricing & Inventory
//     salePrice: "",
//     mrp: "",
//     comparePrice: "",
//     costPrice: "",
//     sku: "",
//     stock: "",
//     trackQuantity: true,

//     // Offers
//     hasOffer: false,
//     offerType: "PERCENTAGE",
//     offerTitle: "",
//     offerValue: "",
//     offerStart: "",
//     offerEnd: "",

//     buyX: "",
//     getY: "",

//     // Media
//     productMedia: [],
//     promotionalMedia: [],

//     // Shipping
//     weight: "",
//     length: "",
//     width: "",
//     height: "",
//     isFragile: false,
//     shippingMethod: "",
//     carrier: "",
//     estimatedDelivery: "",
//     freeDeliveryOption: "none",
//     freeDeliveryProvinces: [],
//     noInternationalShipping: false,
//     restrictedStates: [],

//     // Policies
//     returnType: "NO_RETURN",
//     returnDuration: "",
//     returnUnit: "days",
//     returnConditions: "",
//     returnPolicy: "",
//     returnPeriod: "",

//     warrantyType: "NO_WARRANTY",
//     warrantyDuration: "",
//     warrantyUnit: "months",
//     warrantyDescription: "",
//     warrantyConditions: "",
//     warrantyPeriod: "",
//     warranty: "",
//   });

//   // Populate form data when product data is loaded
//   useEffect(() => {
//     if (productData?.getProduct) {
//       const product = productData.getProduct;
//       const defaultVariant =
//         product.variants?.find((v: any) => v.isDefault) ||
//         product.variants?.[0];

//       setFormData({
//         title: product.name || "",
//         brandId: product.brandId || "",
//         categoryId: product.category.parent.id || "",
//         subcategory: product.category.id || "", // Assuming categoryId is the leaf category
//         description: product.description || "",
//         features: product.features || [],
//         specifications:
//           defaultVariant?.specifications?.reduce((acc: any, spec: any) => {
//             acc[spec.key] = spec.value;
//             return acc;
//           }, {}) || {},
//         specificationDisplayFormat: "bullet",
//         salePrice: defaultVariant?.price?.toString() || "",
//         mrp: defaultVariant?.mrp?.toString() || "",
//         sku: defaultVariant?.sku || "",
//         stock: defaultVariant?.stock?.toString() || "",
//         comparePrice: product.comparePrice?.toString() || "",
//         costPrice: product.costPrice?.toString() || "",
//         trackQuantity: product.trackQuantity ?? true,
//         productMedia:
//           product.images
//             ?.filter((img: any) => img.type === "PRIMARY")
//             .map((img: any) => ({
//               url: img.url,
//               mediaType: "image",
//               altText: img.altText || "",
//               caption: img.altText || "",
//               publicId: img.publicId || "",
//             })) || [],
//         promotionalMedia:
//           product.promotionalImages?.map((img: any) => ({
//             url: img.url,
//             mediaType: "image",
//             altText: img.altText || "",
//             caption: img.altText || "",
//             publicId: img.publicId || "",
//           })) || [],
//         weight: product.weight?.toString() || "",
//         length: product.length || "",
//         height: product.height || "",
//         width: product.width || "",
//         shippingClass: product.shippingClass || "",
//         returnPolicy: product.returnPolicy || "",
//         warranty: product.warranty || "",
//       });
//     }
//   }, [productData]);

//   // Update form data function
//   const updateFormData = (field: keyof FormData, value: any) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));

//     // Clear error for this field when user starts typing
//     if (errors[field]) {
//       setErrors((prev) => ({
//         ...prev,
//         [field]: undefined,
//       }));
//     }
//   };

//   // Validation function for each step
//   const validateStep = (step: number): boolean => {
//     const newErrors: any = {};

//     switch (step) {
//       case 1: // Basic Details
//         if (!formData.title.trim())
//           newErrors.title = "Product title is required";
//         if (!formData.categoryId) {
//           newErrors.categoryId = "Category is required";
//         }
//         if (!formData.subcategory) {
//           newErrors.subcategory = "Subcategory is required";
//         }
//         if (!formData.description.trim()) {
//           newErrors.description = "Product description is required";
//         }
//         break;

//       case 2: // Specifications - no required fields for now
//         break;

//       case 3: // Pricing
//         if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
//           newErrors.price = "Valid selling price is required";
//         }
//         if (!formData.sku.trim()) {
//           newErrors.sku = "SKU is required";
//         }
//         if (!formData.stock || parseInt(formData.stock) < 0) {
//           newErrors.stock = "Valid stock quantity is required";
//         }
//         if (
//           formData.comparePrice &&
//           parseFloat(formData.comparePrice) <= parseFloat(formData.salePrice)
//         ) {
//           newErrors.comparePrice =
//             "Compare price should be higher than selling price";
//         }
//         break;

//       case 4: // Media
//         if (!formData.productMedia || formData.productMedia.length === 0) {
//           newErrors.productMedia = "At least one product image is required";
//         }
//         break;

//       case 5: // Shipping - no required fields
//         break;

//       case 6: // Policies - no required fields
//         break;

//       default:
//         break;
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Navigation functions
//   const nextStep = () => {
//     if (validateStep(currentStep)) {
//       if (currentStep < steps.length) {
//         setCurrentStep(currentStep + 1);
//       }
//     } else {
//       console.log(currentStep);
//       toast.error("Please fix the errors before proceeding to the next step.");
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   // Update function
//   const handleUpdate = async () => {
//     // Validate all steps
//     let isValid = true;
//     for (let i = 1; i <= steps.length; i++) {
//       if (!validateStep(i)) {
//         isValid = false;
//         break;
//       }
//     }

//     if (!isValid) {
//       toast.error("Please fix all errors before updating the product.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // Transform formData to match GraphQL schema
//       const productInput = {
//         id: params.id,
//         name: formData.title,
//         description: formData.description,
//         categoryId: formData.subcategory || null,
//         brandId: formData.brandId || null,
//         variants: [
//           {
//             sku: formData.sku,
//             price: parseFloat(formData.salePrice),
//             stock: parseInt(formData.stock),
//             attributes: {},
//             isDefault: true,
//             specifications: Object.entries(formData.specifications).map(
//               ([key, value]) => ({
//                 key,
//                 value: String(value),
//               })
//             ),
//           },
//         ],
//         images: formData.productMedia.map((media, index) => ({
//           url: media.url,
//           altText: media.altText || media.caption || "",
//           sortOrder: index,
//           type: "PRIMARY",
//         })),
//         promotionalImages: formData.promotionalMedia.map((media, index) => ({
//           url: media.url,
//           altText: media.altText || media.caption || "",
//           sortOrder: index,
//           type: "PROMOTIONAL",
//         })),
//       };

//       const updateProductResponse = await updateProduct({
//         variables: {
//           input: productInput,
//         },
//       });

//       toast.success("Product updated successfully!");
//       router.push("/products");
//     } catch (error: any) {
//       console.error("Error updating product:", error.message);
//       toast.error("Failed to update product. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Delete function
//   const handleDelete = async () => {
//     if (
//       !confirm(
//         "Are you sure you want to delete this product? This action cannot be undone."
//       )
//     ) {
//       return;
//     }

//     setIsDeleting(true);
//     try {
//       // Add your DELETE_PRODUCT mutation here
//       // await deleteProduct({ variables: { id: params.id } });
//       toast.success("Product deleted successfully!");
//       router.push("/products");
//     } catch (error: any) {
//       console.error("Error deleting product:", error.message);
//       toast.error("Failed to delete product. Please try again.");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const renderStepContent = () => {
//     const stepProps = { formData, errors, updateFormData };
//     const categoriesData = getCategoryData?.categories || [];

//     switch (currentStep) {
//       case 1:
//         return (
//           <BasicDetailsStep {...stepProps} categoriesData={categoriesData} />
//         );
//       case 2:
//         return (
//           <SpecificationsStep {...stepProps} categoriesData={categoriesData} />
//         );
//       case 3:
//         return <PricingStep {...stepProps} />;
//       case 4:
//         return <MediaStep {...stepProps} />;
//       case 5:
//         return <ShippingStep {...stepProps} />;
//       case 6:
//         return <PoliciesStep {...stepProps} />;
//       default:
//         return null;
//     }
//   };

//   // Loading states
//   if (productLoading || getCategoryLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4 text-zinc-50"></div>
//           <p>Loading product data...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error states
//   if (productError) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <p className="text-red-500 mb-4">
//             Error loading product: {productError.message}
//           </p>
//           <Button onClick={() => router.push("/products")}>
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Products
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (getCategoryError) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <p className="text-red-500 mb-4">
//             Error loading categories: {getCategoryError.message}
//           </p>
//           <Button onClick={() => router.push("/products")}>
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Products
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const handelDeleteProduct = async () => {
//     console.log("deletigng product");
//     try {
//       await deleteProduct({
//         variables: {
//           productId: params.id,
//         },
//       });
//       router.push("/products");
//       console.log("deleted successfully");
//     } catch (error) {
//       console.log("error-->", error);
//     }
//   };

//   return (
//     <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push("/products")}
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Products
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
//             <p className="text-muted-foreground">
//               Update product information and settings.
//             </p>
//             {productData?.getProduct && (
//               <div className="mt-2 text-sm text-muted-foreground">
//                 Editing:{" "}
//                 <span className="font-medium text-foreground">
//                   {productData.getProduct.name}
//                 </span>
//                 {productData.getProduct.variants?.[0]?.sku && (
//                   <span className="ml-2">
//                     SKU:{" "}
//                     <span className="font-medium text-foreground">
//                       {productData.getProduct.variants[0].sku}
//                     </span>
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             variant="destructive"
//             onClick={() => handelDeleteProduct()}
//             disabled={isDeleting || isSubmitting}
//           >
//             <Trash2 className="h-4 w-4 mr-2" />
//             {isDeleting ? "Deleting..." : "Delete"}
//           </Button>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="text-lg">Product Update Progress</CardTitle>
//               <CardDescription>
//                 Step {currentStep} of {steps.length}
//               </CardDescription>
//             </div>
//             <div className="text-sm text-muted-foreground">
//               {Math.round((currentStep / steps.length) * 100)}% Complete
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       <ProgressStepper steps={steps} currentStep={currentStep} />

//       <Card>
//         <CardHeader>
//           <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
//           <CardDescription>
//             {steps[currentStep - 1]?.description}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>{renderStepContent()}</CardContent>
//       </Card>

//       <FormNavigation
//         currentStep={currentStep}
//         totalSteps={steps.length}
//         onPrev={prevStep}
//         onNext={nextStep}
//         onSubmit={handleUpdate}
//         // isSubmitting={isSubmitting}
//       />
//     </div>
//   );
// }
import React from 'react'

const page = () => {
  return (
    <div>
      
    </div>
  )
}

export default page
