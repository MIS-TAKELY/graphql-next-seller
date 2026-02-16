// utils/product/transformProductData.ts
import { FormData, Product } from "@/types/pages/product";
import { DiscountType, ReturnType, ProductStatus, WarrantyType } from "@/types/common/enums";
import type { ProductAttribute } from "@/types/product/product.types";
import type { ProductVariantData, DeliveryOptionData } from "@/types/product/product-form.types";

export const transformProductToFormData = (product: Product): FormData => {
  if (!product) return {} as FormData;

  // Get the first variant for pricing info
  const firstVariant = product.variants?.[0] || {};

  // Extract category hierarchy
  const categoryHierarchy = getCategoryHierarchy(product.category);

  // Transform images to media format
  const productMedia =
    product.images
      ?.filter((img) => img.mediaType === "PRIMARY")
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((img, index) => ({
        url: img.url,
        altText: img.altText || "",
        mediaType: img.mediaType,
        fileType: img.fileType,
        publicId: (img as { publicId?: string }).publicId || "",
        sortOrder: img.sortOrder ?? index,
      })) || [];

  const promotionalMedia =
    product.images
      ?.filter((img) => img.mediaType === "PROMOTIONAL")
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((img, index) => ({
        url: img.url,
        altText: img.altText || "",
        mediaType: img.mediaType,
        fileType: img.fileType,
        publicId: (img as { publicId?: string }).publicId || "",
        sortOrder: img.sortOrder ?? index,
      })) || [];

  console.log("varient---->", firstVariant.attributes);

  // Transform specifications
  const specifications =
    firstVariant.specifications?.map((spec) => ({
      id: `spec_${Math.random()}`,
      key: spec.key,
      value: spec.value,
    })) || [];

  const specificationTable = firstVariant.specificationTable || product.specificationTable;

  // Get offer data if exists
  const offer = product.productOffers?.[0]?.offer;

  // Get delivery, warranty, and return policy
  const deliveryOption = product.deliveryOptions?.[0];
  const warranty = product.warranty?.[0];
  const returnPolicy = product.returnPolicy?.[0];

  // Determine if product has variants
  const hasVariants = (product.variants?.length || 0) > 1;

  // Extract attributes from variants
  const attributes: ProductAttribute[] = [];
  if (product.variants && product.variants.length > 0) {
    const attributeMap = new Map<string, Set<string>>();
    product.variants.forEach((variant) => {
      if (variant.attributes) {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!attributeMap.has(key)) {
            attributeMap.set(key, new Set());
          }
          if (value !== null && value !== undefined) {
            attributeMap.get(key)!.add(String(value));
          }
        });
      }
    });
    attributes.push(...Array.from(attributeMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    })));
  }

  // Transform variants to ProductVariantData
  const variants: ProductVariantData[] = product.variants?.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    price: typeof variant.price === 'string' ? variant.price : variant.price?.toString() || "",
    mrp: typeof variant.mrp === 'string' ? variant.mrp : variant.mrp?.toString() || "",
    stock: variant.stock?.toString() || "",
    attributes: (variant.attributes as Record<string, string>) || {},
    isDefault: variant.isDefault,
    specifications: variant.specifications?.map((spec) => ({
      key: spec.key,
      value: spec.value,
    })),
    specificationTable: variant.specificationTable,
  })) || [];

  // Transform delivery options
  const deliveryOptions: DeliveryOptionData[] = product.deliveryOptions?.map((opt) => ({
    title: opt.title,
    description: opt.description,
    isDefault: opt.isDefault,
  })) || [];

  return {
    // Basic Details
    name: product.name || "",
    description: product.description || "",
    brand: product.brand || "",
    ...categoryHierarchy,
    status: product.status || ProductStatus.ACTIVE,
    hasVariants,
    attributes,
    variants,
    deliveryOptions,

    // Specifications
    features: product.features || [],
    specifications,
    specificationTable,
    specificationDisplayFormat: product.specificationDisplayFormat || "bullet",

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
    offerType: offer?.type || DiscountType.PERCENTAGE,
    offerTitle: offer?.title || "",
    offerValue: offer?.value?.toString() || "",
    offerStart: offer?.startDate ? formatDate(typeof offer.startDate === 'string' ? offer.startDate : offer.startDate.toISOString()) : "",
    offerEnd: offer?.endDate ? formatDate(typeof offer.endDate === 'string' ? offer.endDate : offer.endDate.toISOString()) : "",

    buyX: product.productOffers?.[0]?.offer?.buyX?.toString?.() || "",
    getY: product.productOffers?.[0]?.offer?.getY?.toString?.() || "",

    // Media
    productMedia,
    promotionalMedia,

    // Shipping
    deliveryCharge: product.deliveryCharge?.toString() || "0",
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
    returnType: returnPolicy?.type || ReturnType.NO_RETURN,
    returnDuration: returnPolicy?.duration?.toString() || "",
    returnUnit: returnPolicy?.unit || "days",
    returnConditions: returnPolicy?.conditions || "",
    returnPolicy: returnPolicy?.conditions || "",
    returnPeriod: "",

    // Warranty
    warrantyType: warranty?.type || WarrantyType.NO_WARRANTY,
    warrantyDuration: warranty?.duration?.toString() || "",
    warrantyUnit: warranty?.unit || "months",
    warrantyDescription: warranty?.description || "",
    warrantyConditions: "",
    warranty: warranty?.description || "",
  };
};

// Helper function to extract category hierarchy
const getCategoryHierarchy = (category: Product["category"]) => {
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
