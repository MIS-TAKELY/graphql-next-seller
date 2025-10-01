// types/pages/product.ts

export interface Step {
  id: number;
  title: string;
  description: string;
}


export interface ICreateProductInput {
  name: string;
  description: string;
  categoryId: string;
  brand: string;
  variants: {
    sku: string;
    price: number;
    mrp: number;
    stock: number;
    attributes?: {
      weight?: number;
      dimensions?: number;
      shippingClass?: string;
    };
    isDefault: boolean;
    specifications?: Array<{
      key: string;
      value: string;
    }>;
  };
  productOffers?: Array<{
    productId?: string;
    offer: {
      title: string;
      description?: string;
      type: "PERCENTAGE" | "FIXED_AMOUNT";
      value: number;
      startDate: string;
      endDate: string;
    };
  }>;
  deliveryOptions?: Array<{
    title: string;
    description?: string;
    isDefault: boolean;
  }>;
  warranty?: Array<{
    type: "SELLER" | "MANUFACTURER" | "NO_WARRANTY";
    duration: number;
    unit: string;
    description?: string;
  }>;
  returnPolicy?: Array<{
    type: "NO_RETURN" | "REPLACEMENT" | "REFUND" | "REPLACEMENT_OR_REFUND";
    duration: number;
    unit: string;
    conditions?: string;
  }>;
  images?: Array<{
    url: string;
    altText?: string;
    type: "PRIMARY" | "PROMOTIONAL";
    sortOrder: number;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  parent?: Category | null; // recursive for nested categories
}

export interface FormData {
  // Basic Details
  title: string;
  description: string;
  categoryId: string;
  subcategory: string;
  brandId: string;

  // Specifications
  features: string[];
  specifications: Array<{
    id?: string;
    key: string;
    value: string;
  }>;
  specificationDisplayFormat: "bullet" | "table";

  // Pricing & Inventory
  salePrice: string;
  mrp: string;
  comparePrice: string;
  costPrice: string;
  sku: string;
  stock: string;
  trackQuantity: boolean;

  // Offers
  hasOffer: boolean;
  offerType: "PERCENTAGE" | "FIXED_AMOUNT";
  offerTitle: string;
  offerValue: string;
  offerStart: string;
  offerEnd: string;

  // Discounts (legacy - can be removed if using offers)
  // hasDiscount: boolean;
  // discountType: string;
  // discountValue: string;
  // discountStart: string;
  // discountEnd: string;
  // maximumDiscount: string;
  // minimumAmount: string;
  // maxUsageTotal: string;
  // maxUsagePerUser: string;
  buyX: string;
  getY: string;

  // Media
  productMedia: Media[];
  promotionalMedia: Media[];

  // Shipping
  weight: string;
  length: string;
  width: string;
  height: string;
  isFragile: boolean;
  shippingMethod: string;
  carrier: string;
  estimatedDelivery: string;
  freeDeliveryOption: string;
  freeDeliveryProvinces: string[];
  noInternationalShipping: boolean;
  restrictedStates: string[];

  // Policies
  returnType: string;
  returnDuration: string;
  returnUnit: string;
  returnConditions: string;
  returnPolicy: string;
  returnPeriod: string;

  warrantyType: string;
  warrantyDuration: string;
  warrantyUnit: string;
  warrantyDescription: string;
  warrantyConditions: string;
  warrantyPeriod: string;
  warranty: string;
}

export interface Media {
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  publicId?: string;
  altText?: string;
  caption?: string;
}

export interface Errors {
  [key: string]: string | undefined;
}


export interface GetProductCategory {
  id: string;
  parent: Category | null;
}

export interface ProductImage {
  url: string;
}

export interface ProductVariant {
  price: number;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  status: string;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
}
