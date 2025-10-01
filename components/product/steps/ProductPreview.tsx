"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormData } from "@/types/pages/product";

// New ProductPreview component import
export const ProductPreview = ({ formData }: { formData: FormData }) => {
  const calculateDiscountPreview = () => {
    // if (!formData.hasDiscount || !formData.salePrice) return "N/A";
    // const price = parseFloat(formData.salePrice) || 0;
    // const value = parseFloat(formData.discountValue) || 0;

    // switch (formData.discountType) {
    //   case "PERCENTAGE":
    //     if (!value) return "N/A";
    //     const discount = (price * value) / 100;
    //     return formData.maximumDiscount &&
    //       discount > parseFloat(formData.maximumDiscount)
    //       ? `NPR ${parseFloat(formData.maximumDiscount).toFixed(2)}`
    //       : `NPR ${discount.toFixed(2)}`;
    //   case "FIXED_AMOUNT":
    //     return value ? `NPR ${value.toFixed(2)}` : "N/A";
    //   case "BUY_X_GET_Y":
    //     return formData.buyX && formData.getY
    //       ? `Buy ${formData.buyX}, Get ${formData.getY} Free`
    //       : "N/A";
    //   case "FREE_SHIPPING":
    //     return "Free Shipping";
    //   default:
    //     return "N/A";
    // }
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>Product Preview</CardTitle>
        <CardDescription>
          Preview how your product will appear to customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Basic Details
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium">Title:</span>{" "}
              {formData.title || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Brand:</span>{" "}
              {formData.brandId || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Category:</span>{" "}
              {formData.categoryId || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Subcategory:</span>{" "}
              {formData.subcategory || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Description:</span>{" "}
              {formData.description || "Not provided"}
            </p>
          </div>
        </div>

        {/* Specifications */}
        {formData.specifications.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Specifications
            </h3>
            {formData.specificationDisplayFormat === "bullet" ? (
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {formData.specifications
                  .filter((spec) => spec.key && spec.value)
                  .map((spec, index) => (
                    <li key={index} className="flex">
                      <span className="font-medium mr-2">•</span>
                      <span>
                        <span className="font-medium">{spec.key}:</span>{" "}
                        {spec.value}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                  <tbody>
                    {formData.specifications
                      .filter((spec) => spec.key && spec.value)
                      .map((spec, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-gray-50 dark:bg-gray-900"
                              : "bg-white dark:bg-gray-800"
                          }
                        >
                          <td className="px-4 py-2 font-medium border-r">
                            {spec.key}
                          </td>
                          <td className="px-4 py-2">{spec.value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pricing & Discounts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Pricing & Discounts
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium">Sale Price:</span>{" "}
              {formData.salePrice
                ? `NPR ${formData.salePrice}`
                : "Not provided"}
            </p>
            <p>
              <span className="font-medium">Compare Price:</span>{" "}
              {formData.comparePrice ? `NPR ${formData.comparePrice}` : "N/A"}
            </p>
            <p>
              <span className="font-medium">Cost Price:</span>{" "}
              {formData.costPrice ? `NPR ${formData.costPrice}` : "N/A"}
            </p>
            <p>
              <span className="font-medium">Stock:</span>{" "}
              {formData.stock || "Not provided"}
            </p>
            <p>
              <span className="font-medium">SKU:</span>{" "}
              {formData.sku || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Track Quantity:</span>{" "}
              {formData.trackQuantity ? "Yes" : "No"}
            </p>
            {/* {formData.hasDiscount && (
              <>
                <p>
                  <span className="font-medium">Discount Type:</span>{" "}
                  {formData.discountType || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Discount Preview:</span>{" "}
                  {calculateDiscountPreview()}
                </p>
                <p>
                  <span className="font-medium">Discount Start:</span>{" "}
                  {formData.discountStart || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Discount End:</span>{" "}
                  {formData.discountEnd || "Not provided"}
                </p>
                {formData.discountType === "PERCENTAGE" && (
                  <p>
                    <span className="font-medium">Maximum Discount:</span>{" "}
                    {formData.maximumDiscount
                      ? `NPR ${formData.maximumDiscount}`
                      : "N/A"}
                  </p>
                )}
                {formData.discountType === "BUY_X_GET_Y" && (
                  <>
                    <p>
                      <span className="font-medium">Buy Quantity:</span>{" "}
                      {formData.buyX || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Get Quantity:</span>{" "}
                      {formData.getY || "Not provided"}
                    </p>
                  </>
                )}
                <p>
                  <span className="font-medium">Minimum Purchase:</span>{" "}
                  {formData.minimumAmount
                    ? `NPR ${formData.minimumAmount}`
                    : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Usage Limit:</span>{" "}
                  {formData.maxUsageTotal || "Unlimited"}
                </p>
                <p>
                  <span className="font-medium">Per User Limit:</span>{" "}
                  {formData.maxUsagePerUser || "Unlimited"}
                </p>
              </>
            )} */}
          </div>
        </div>

        {/* Media */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Media
          </h3>
          <div className="space-y-4">
            {formData.productMedia.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Images
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  {formData.productMedia.map((media, index) => (
                    <div key={index} className="relative">
                      {media.mediaType === "IMAGE" ? (
                        <img
                          src={media.url}
                          alt={
                            media.altText || media.caption || "Product image"
                          }
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {formData.promotionalMedia.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Promotional Media
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  {formData.promotionalMedia.map((media, index) => (
                    <div key={index} className="relative">
                      {media.mediaType === "IMAGE" ? (
                        <img
                          src={media.url}
                          alt={
                            media.altText ||
                            media.caption ||
                            "Promotional image"
                          }
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {formData.productMedia.length === 0 &&
              formData.promotionalMedia.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No media uploaded
                </p>
              )}
          </div>
        </div>

        {/* Shipping */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Shipping
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium">Weight:</span>{" "}
              {formData.weight ? `${formData.weight} kg` : "Not provided"}
            </p>
            <p>
              <span className="font-medium">Dimensions:</span>{" "}
              {formData.length && formData.width && formData.height
                ? `${formData.length} x ${formData.width} x ${formData.height} cm`
                : "Not provided"}
            </p>
            <p>
              <span className="font-medium">Fragile:</span>{" "}
              {formData.isFragile ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Shipping Method:</span>{" "}
              {formData.shippingMethod || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Carrier:</span>{" "}
              {formData.carrier || "Any carrier"}
            </p>
            <p>
              <span className="font-medium">Estimated Delivery:</span>{" "}
              {formData.estimatedDelivery || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Free Delivery:</span>{" "}
              {formData.freeDeliveryOption === "all_nepal"
                ? "Free delivery across Nepal"
                : formData.freeDeliveryOption === "selected_provinces"
                ? `Free delivery in: ${
                    formData.freeDeliveryProvinces?.join(", ") || "None"
                  }`
                : "No free delivery"}
            </p>
            <p>
              <span className="font-medium">International Shipping:</span>{" "}
              {formData.noInternationalShipping ? "Not allowed" : "Allowed"}
            </p>
            <p>
              <span className="font-medium">Restricted States:</span>{" "}
              {formData.restrictedStates
                ? formData.restrictedStates?.join(", ")
                : "None"}
            </p>
          </div>
        </div>

        {/* Policies */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Policies
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium">Return Policy:</span>{" "}
              {formData.returnPolicy ||
              formData.returnPeriod ||
              formData.returnConditions
                ? `${formData.returnPeriod || "Not specified"} - ${
                    formData.returnConditions ||
                    formData.returnPolicy ||
                    "Not specified"
                  }`
                : "Not provided"}
            </p>
            <p>
              <span className="font-medium">Warranty:</span>{" "}
              {formData.warranty ||
              formData.warrantyPeriod ||
              formData.warrantyConditions
                ? `${formData.warrantyPeriod || "Not specified"} - ${
                    formData.warrantyConditions ||
                    formData.warranty ||
                    "Not specified"
                  }`
                : "Not provided"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
