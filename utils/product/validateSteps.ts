import { FormData, ICreateProductInput } from "@/types/pages/product";

export const validateStep = (
  step: number,
  formData: FormData,
  setErrors: (errors: any) => void
): boolean => {
  const newErrors: any = {};

  switch (step) {
    case 1:
      if (!formData.name.trim()) newErrors.name = "Product title is required";
      if (!formData.categoryId) newErrors.categoryId = "Category is required";
      if (!formData.subcategory)
        newErrors.subcategory = "Subcategory is required";
      if (!formData.description.trim())
        newErrors.description = "Product description is required";
      break;

    case 3:
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.salePrice = "Valid selling price is required";
      }
      if (!formData.sku?.trim()) newErrors.sku = "SKU is required";
      if (!formData.stock || parseInt(formData.stock) < 0) {
        newErrors.stock = "Valid stock quantity is required";
      }
      break;

    case 4:
      if (step === 4) {
        // Media step
        if (formData.productMedia.length === 0) {
          newErrors.productMedia = "At least one product image is required.";
        }
        break;
      }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// transform FormData -> ICreateProductInput
// transform FormData -> ICreateProductInput
export const buildProductInput = (formData: FormData,id:string): ICreateProductInput => ({
  id,
  name: formData.name,
  description: formData.description,
  categoryId: formData.subSubcategory || formData.subcategory,
  brand: formData.brand || "Generic",
  variants: {
    sku: formData.sku,
    price: parseFloat(formData.price) || 0,
    mrp: parseFloat(formData.mrp) || 0,
    stock: parseInt(formData.stock, 10) || 0,
    isDefault: true,
    attributes: {
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      length: formData.length ? parseFloat(formData.weight) : undefined,
      width: formData.width ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.weight) : undefined,
      shippingClass: formData.shippingMethod || undefined,
    },
    specifications: formData.specifications
      .filter((spec) => spec.key && spec.value)
      .map((spec) => ({ key: spec.key, value: spec.value })),
  },
  productOffers: formData.hasOffer
    ? [
        {
          offer: {
            title: formData.offerTitle,
            type: formData.offerType,
            value: parseFloat(formData.offerValue) || 0,
            startDate: formData.offerStart,
            endDate: formData.offerEnd,
          },
        },
      ]
    : undefined,
  deliveryOptions:
    formData.freeDeliveryOption !== "none"
      ? [
          {
            title:
              formData.freeDeliveryOption === "all_nepal"
                ? "Free Delivery Across Nepal"
                : "Free Delivery in Selected Provinces",
            description:
              formData.freeDeliveryOption === "selected_provinces"
                ? formData.freeDeliveryProvinces.join(", ")
                : "Available across all provinces",
            isDefault: true,
          },
        ]
      : undefined,
  warranty:
    formData.warrantyType !== "NO_WARRANTY" && formData.warrantyDuration
      ? [
          {
            type: formData.warrantyType as "SELLER" | "MANUFACTURER",
            duration: parseInt(formData.warrantyDuration, 10) || 0,
            unit: formData.warrantyUnit,
            description: formData.warrantyDescription,
          },
        ]
      : undefined,
  returnPolicy:
    formData.returnType !== "NO_RETURN" && formData.returnDuration
      ? [
          {
            type: formData.returnType as
              | "NO_RETURN"
              | "REPLACEMENT"
              | "REFUND"
              | "REPLACEMENT_OR_REFUND",
            duration: parseInt(formData.returnDuration, 10) || 0,
            unit: formData.returnUnit,
            conditions: formData.returnConditions,
          },
        ]
      : undefined,
  images: [
    // Product media: PRIMARY
    ...formData.productMedia.map((media, index) => ({
      url: media.url,
      altText: media.altText || "",
      mediaType: "PRIMARY" as const, // Fixed: Use literal, not media.mediaType (which is role)
      fileType: media.fileType, // Already "IMAGE" | "VIDEO"
      sortOrder: index,
    })),
    // Promotional media: PROMOTIONAL
    ...formData.promotionalMedia.map((media, index) => ({
      url: media.url,
      altText: media.altText || "",
      mediaType: "PROMOTIONAL" as const, // Fixed: Use mediaType, not type
      fileType: media.fileType, // Add: Was missing
      sortOrder: formData.productMedia.length + index,
    })),
  ],
});
