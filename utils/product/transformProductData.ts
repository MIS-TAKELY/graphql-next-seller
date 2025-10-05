// utils/product/transformProductData.ts
import { FormData } from "@/types/pages/product";

export const transformProductToFormData = (product: any): FormData => {
  if (!product) return {} as FormData;

  // Get the first variant for pricing info
  const firstVariant = product.variants?.[0] || {};

  // Extract category hierarchy
  const categoryHierarchy = getCategoryHierarchy(product.category);

  // Transform images to media format
  const productMedia =
    product.images
      ?.filter((img: any) => img.mediaType === "PRIMARY")
      .map((img: any) => ({
        url: img.url,
        altText: img.altText || "",
        mediaType: img.mediaType,
        fileType: img.fileType,
        publicId: img.publicId || "",
      })) || [];

  const promotionalMedia =
    product.images
      ?.filter((img: any) => img.mediaType === "PROMOTIONAL")
      .map((img: any) => ({
        url: img.url,
        altText: img.altText || "",
        mediaType: img.mediaType,
        fileType: img.fileType,
        publicId: img.publicId || "",
      })) || [];

  console.log("varient---->", firstVariant.attributes);

  // Transform specifications
  const specifications =
    firstVariant.specifications?.map((spec: any) => ({
      id: `spec_${Math.random()}`,
      key: spec.key,
      value: spec.value,
    })) || [];

  // Get offer data if exists
  const offer = product.productOffers?.[0]?.offer;

  // Get delivery, warranty, and return policy
  const deliveryOption = product.deliveryOptions?.[0];
  const warranty = product.warranty?.[0];
  const returnPolicy = product.returnPolicy?.[0];

  return {
    // Basic Details
    name: product.name || "",
    description: product.description || "",
    brand: product.brand || "",
    ...categoryHierarchy,

    // Specifications
    features: product.features || [],
    specifications,
    specificationDisplayFormat: "bullet",

    // Pricing & Inventory
    price: firstVariant.price?.toString() || "",
    mrp: firstVariant.mrp?.toString() || "",
    comparePrice: firstVariant.comparePrice?.toString() || "",
    costPrice: firstVariant.costPrice?.toString() || "",
    sku: firstVariant.sku || "",
    stock: firstVariant.stock?.toString() || "",
    trackQuantity: true,

    // Offers
    hasOffer: !!offer,
    offerType: offer?.type || "PERCENTAGE",
    offerTitle: offer?.title || "",
    offerValue: offer?.value?.toString() || "",
    offerStart: offer?.startDate ? formatDate(offer.startDate) : "",
    offerEnd: offer?.endDate ? formatDate(offer.endDate) : "",

    buyX: product.productOffers?.[0]?.offer?.buyX?.toString?.() || "",
    getY: product.productOffers?.[0]?.offer?.getY?.toString?.() || "",

    // Media
    productMedia,
    promotionalMedia,

    // Shipping
    weight: firstVariant?.attributes?.weight?.toString() || "",
    length: firstVariant?.attributes?.length?.toString() || "",
    width: firstVariant?.attributes?.width?.toString() || "",
    height: firstVariant?.attributes?.height?.toString() || "",
    isFragile: product.isFragile || false,
    shippingMethod: firstVariant?.attributes?.shippingClass || "",
    carrier: deliveryOption?.carrier || "",
    estimatedDelivery: deliveryOption?.estimatedDelivery || "",
    freeDeliveryOption: deliveryOption?.title || "none",
    freeDeliveryProvinces: deliveryOption?.freeDeliveryProvinces || [],
    noInternationalShipping: product.noInternationalShipping || false,
    restrictedStates: product.restrictedStates || [],

    // Return Policy
    returnType: returnPolicy?.type || "NO_RETURN",
    returnDuration: returnPolicy?.duration?.toString() || "",
    returnUnit: returnPolicy?.unit || "days",
    returnConditions: returnPolicy?.conditions || "",
    returnPolicy: returnPolicy?.description || "",
    returnPeriod: returnPolicy?.period || "",

    // Warranty
    warrantyType: warranty?.type || "NO_WARRANTY",
    warrantyDuration: warranty?.duration?.toString() || "",
    warrantyUnit: warranty?.unit || "months",
    warrantyDescription: warranty?.description || "",
    warrantyConditions: warranty?.conditions || "",
    warranty: warranty?.description || "",
  };
};

// Helper function to extract category hierarchy
const getCategoryHierarchy = (category: any) => {
  if (!category) return { categoryId: "", subcategory: "", subSubcategory: "" };

  // If category has grandparent (3 levels)
  if (category.parent?.parent) {
    return {
      categoryId: category.parent.parent.id,
      subcategory: category.parent.id,
      subSubcategory: category.id,
      category: category, // Keep original for reference
    };
  }

  // If category has parent (2 levels)
  if (category.parent) {
    return {
      categoryId: category.parent.id,
      subcategory: category.id,
      subSubcategory: "",
      category: category,
    };
  }

  return {
    categoryId: category.id,
    subcategory: "",
    subSubcategory: "",
    category: category,
  };
};

const formatDate = (dateInput?: string | number) => {
  if (!dateInput) return "";

  // If input looks like a number in string form, parse it
  const value =
    typeof dateInput === "string" && /^\d+$/.test(dateInput)
      ? parseInt(dateInput, 10)
      : dateInput;

  const date = new Date(value);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};
