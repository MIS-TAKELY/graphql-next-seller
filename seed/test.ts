// // types/pages/product.ts

// import { Category } from "../category.type";

// export interface Step {
//   id: number;
//   title: string;
//   description: string;
// }

// export interface ICreateProductInput {
//   id?: string;
//   name: string;
//   description: string;
//   categoryId: string;
//   brand: string;
//   variants: {
//     sku: string;
//     price: number;
//     mrp: number;
//     stock: number;
//     attributes?: {
//       weight?: number;
//       height?: number;
//       length?: number;
//       width?: number;
//       shippingClass?: string;
//     };
//     isDefault: boolean;
//     specifications?: Array<{
//       key: string;
//       value: string;
//     }>;
//   };
//   productOffers?: Array<{
//     productId?: string;
//     offer: {
//       title: string;
//       description?: string;
//       type: "PERCENTAGE" | "FIXED_AMOUNT";
//       value: number;
//       startDate: string;
//       endDate: string;
//     };
//   }>;
//   deliveryOptions?: Array<{
//     title: string;
//     description?: string;
//     isDefault: boolean;
//   }>;
//   warranty?: Array<{
//     type: "SELLER" | "MANUFACTURER" | "NO_WARRANTY";
//     duration: number;
//     unit: string;
//     description?: string;
//   }>;
//   returnPolicy?: Array<{
//     type: "NO_RETURN" | "REPLACEMENT" | "REFUND" | "REPLACEMENT_OR_REFUND";
//     duration: number;
//     unit: string;
//     conditions?: string;
//   }>;
//   images?: Array<{
//     url: string;
//     altText?: string;
//     mediaType?: "PRIMARY" | "PROMOTIONAL";
//     fileType?: "IMAGE" | "VIDEO";
//     sortOrder: number;
//   }>;
// }

// export interface FormData {
//   // Basic Details
//   name: string;
//   description: string;
//   category?: Category;
//   categoryId: string;
//   subcategory: string;
//   subSubcategory?: string;
//   brand: string;

//   // Specifications
//   features: string[];
//   specifications: Array<{
//     id?: string;
//     key: string;
//     value: string;
//   }>;
//   specificationDisplayFormat: "bullet" | "table";

//   // Pricing & Inventory
//   price: string;
//   mrp: string;
//   comparePrice: string;
//   costPrice: string;
//   sku: string;
//   stock: string;
//   trackQuantity: boolean;

//   // Offers
//   hasOffer: boolean;
//   offerType: "PERCENTAGE" | "FIXED_AMOUNT";
//   offerTitle: string;
//   offerValue: string;
//   offerStart: string;
//   offerEnd: string;

//   buyX: string;
//   getY: string;

//   // Media
//   productMedia: Media[];
//   promotionalMedia: Media[];

//   // Shipping
//   weight: string;
//   length: string;
//   width: string;
//   height: string;
//   isFragile: boolean;
//   shippingMethod: string;
//   carrier: string;
//   estimatedDelivery: string;
//   freeDeliveryOption: string;
//   freeDeliveryProvinces: string[];
//   noInternationalShipping: boolean;
//   restrictedStates: string[];

//   // Policies
//   returnType: string;
//   returnDuration: string;
//   returnUnit: string;
//   returnConditions: string;
//   returnPolicy: string;
//   returnPeriod: string;

//   warrantyType: string;
//   warrantyDuration: string;
//   warrantyUnit: string;
//   warrantyDescription: string;
//   warrantyConditions: string;
//   // warrantyPeriod: string;
//   warranty: string;
// }

// export interface Media {
//   url: string;
//   mediaType: "PRIMARY" | "PROMOTIONAL";
//   publicId?: string;
//   altText?: string;
//   fileType?: "IMAGE" | "VIDEO";
//   pending?: boolean;
//   isLocal?: boolean;
//    sortOrder?: number;
// }

// export interface Errors {
//   [key: string]: string | undefined;
// }

// export interface ProductImage {
//   url: string;
// }

// export interface ProductVariant {
//   price: number;
//   sku: string;
//   stock: number;
// }

// export interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   status: string;
//   category: Category;
//   images: ProductImage[];
//   variants: ProductVariant[];
 
// }
