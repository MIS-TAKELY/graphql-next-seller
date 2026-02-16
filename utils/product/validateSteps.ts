// utils/product/validateSteps.ts

import { FileType } from "@/types/common/enums";
import { FormData, ICreateProductInput } from "@/types/pages/product";

export const validateStep = (
  step: number,
  formData: FormData,
  setErrors: (errors: Record<string, string>) => void
): boolean => {
  const newErrors: Record<string, string> = {};

  switch (step) {
    case 1: // Basic Details
      // 1. Product Title Validation
      if (!formData.name.trim()) {
        newErrors.name = "Product title is required";
      } else {
        if (formData.name.length > 70) {
          newErrors.name = "Product title must be 70 characters or less";
        }
        // Allowed symbols: ALL special characters allowed.
        // Restriction: No Emojis.
        const emojiRegex = /\p{Emoji_Presentation}/u;
        if (emojiRegex.test(formData.name)) {
          newErrors.name = "Emojis are not allowed in the title";
        }
      }

      if (!formData.categoryId) newErrors.categoryId = "Category is required";
      if (!formData.subcategory)
        newErrors.subcategory = "Subcategory is required";

      // 2. Product Description Validation
      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      } else {
        const description = formData.description;

        // Word count: 5 - 600 words
        const wordCount = description.trim().split(/\s+/).length;
        if (wordCount < 5 || wordCount > 600) {
          newErrors.description = `Description must be between 5 and 600 words. Current: ${wordCount}`;
        }

        // No Emojis
        const emojiRegex = /\p{Emoji_Presentation}/u;
        if (emojiRegex.test(description)) {
          newErrors.description = "Emojis are not allowed in the description";
        }

        // All-Caps check removed.
      }
      break;

    case 2: // Specifications
      // Optional: Add check if specs are required
      break;
    case 3: // Variants & Pricing
      if (formData.hasVariants) {
        if (formData.variants.length === 0) {
          newErrors.variants =
            "Please define attributes and generate variants.";
        } else {
          formData.variants.forEach((variant, index) => {
            if (!variant.sku?.trim()) {
              newErrors[`variant_sku_${index}`] = `Variant ${index + 1
                }: SKU is required`;
            }
            if (!variant.price || parseFloat(variant.price) <= 0) {
              newErrors[`variant_price_${index}`] = `Variant ${index + 1
                }: Valid price is required`;
            }
            if (
              variant.stock === "" ||
              parseInt(String(variant.stock), 10) < 0
            ) {
              newErrors[`variant_stock_${index}`] = `Variant ${index + 1
                }: Valid stock is required`;
            }
          });
        }
      } else {
        // Simple product
        if (!formData.price || parseFloat(formData.price) <= 0) {
          newErrors.price = "Valid selling price is required";
        }
        if (!formData.sku?.trim()) {
          newErrors.sku = "SKU is required";
        }
        if (formData.stock === "" || parseInt(String(formData.stock), 10) < 0) {
          newErrors.stock = "Valid stock quantity is required";
        }
      }
      break;

    case 4: // Media
      if (formData.productMedia.length === 0) {
        newErrors.productMedia = "At least one product image is required.";
      }
      break;

    case 5: // Shipping
      // FIXED: Allow 0 weight if necessary, but strictly check for empty string
      // if (formData.weight === "" || parseFloat(String(formData.weight)) < 0) {
      //   newErrors.weight = "Valid weight is required";
      // }
      break;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// --- BUILDER FUNCTION ---

export const buildProductInput = (
  formData: FormData,
  productId?: string
): ICreateProductInput => {
  // 1. Construct Variants Array
  let apiVariants = [];

  if (formData.hasVariants) {
    // Map generated variants from UI
    apiVariants = formData.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: parseFloat(v.price) || 0,
      mrp: parseFloat(v.mrp) || parseFloat(v.price) || 0,
      stock: parseInt(String(v.stock), 10) || 0,
      attributes: {
        ...v.attributes,
        weight: formData.weight,
        length: formData.length,
        width: formData.width,
        height: formData.height,
        isFragile: formData.isFragile,
      },
      isDefault: v.isDefault,
      specificationTable: v.specificationTable,
      // Pass global specs to variants
      specifications: Array.from(
        new Map(
          formData.specifications
            .filter((s) => s.key && s.value)
            .map((s) => [s.key, s.value])
        )
      ).map(([key, value]) => ({ key, value })),
    }));
  } else {
    // Create single variant for simple product
    apiVariants = [
      {
        id: undefined, // Add logic here if editing a simple product to find its variant ID
        sku: formData.sku,
        price: parseFloat(formData.price) || 0,
        mrp: parseFloat(formData.mrp) || parseFloat(formData.price) || 0,
        stock: parseInt(String(formData.stock), 10) || 0,
        attributes: {
          weight: formData.weight,
          length: formData.length,
          width: formData.width,
          height: formData.height,
          isFragile: formData.isFragile,
        }, // Saved in attributes
        isDefault: true,
        specificationTable: formData.specificationTable,
        specifications: Array.from(
          new Map(
            formData.specifications
              .filter((s) => s.key && s.value)
              .map((s) => [s.key, s.value])
          )
        ).map(([key, value]) => ({ key, value })),
      },
    ];
  }

  // 2. Construct Final Payload
  return {
    id: productId,
    name: formData.name,
    description: formData.description,
    // Logic to pick the most specific category ID
    categoryId:
      formData.subSubcategory || formData.subcategory || formData.categoryId,
    brand: formData.brand || "Generic",
    status: formData.status,
    specificationTable: formData.specificationTable,
    specificationDisplayFormat: formData.specificationDisplayFormat,

    variants: apiVariants,

    images: [
      ...formData.productMedia.map((media, index) => ({
        url: media.url,
        altText: media.altText || "",
        mediaType: media.mediaType,
        fileType: media.fileType ?? FileType.IMAGE,
        sortOrder: media.sortOrder ?? index,
      })),
      ...formData.promotionalMedia.map((media, index) => ({
        url: media.url,
        altText: media.altText || "",
        mediaType: media.mediaType,
        fileType: media.fileType ?? FileType.IMAGE,
        sortOrder: media.sortOrder ?? (formData.productMedia.length + index),
      })),
    ],

    productOffers: formData.hasOffer
      ? [
        {
          offer: {
            title: formData.offerTitle,
            description: "", // Added to satisfy type
            type: formData.offerType,
            value: parseFloat(formData.offerValue) || 0,
            startDate: formData.offerStart,
            endDate: formData.offerEnd,
            isActive: true,
          },
        },
      ]
      : undefined,

    deliveryOptions:
      formData.deliveryOptions.length > 0
        ? formData.deliveryOptions.map((opt) => ({
          title: opt.title,
          description: opt.description,
          isDefault: opt.isDefault,
        }))
        : undefined,

    deliveryCharge: parseFloat(formData.deliveryCharge) || 0,

    warranty:
      formData.warrantyType !== "NO_WARRANTY"
        ? [
          {
            type: formData.warrantyType,
            duration: parseInt(formData.warrantyDuration, 10) || 0,
            unit: formData.warrantyUnit,
            description: formData.warrantyDescription,
          },
        ]
        : undefined,

    returnPolicy:
      formData.returnType !== "NO_RETURN"
        ? [
          {
            type: formData.returnType,
            duration: parseInt(formData.returnDuration, 10) || 0,
            unit: formData.returnUnit,
            conditions: formData.returnConditions,
          },
        ]
        : undefined,
  };
};
