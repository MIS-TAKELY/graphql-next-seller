import { FormField, ValidatedInput } from "@/components/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Errors, FormData } from "@/types/pages/product";

interface PricingStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
}

export const PricingStep = ({
  formData,
  errors,
  updateFormData,
}: PricingStepProps) => {
  // Calculate offer preview based on offer type
  const calculateOfferPreview = () => {
    if (!formData.hasOffer || !formData.salePrice) {
      return "N/A";
    }
    const price = parseFloat(formData.salePrice) || 0;
    const value = parseFloat(formData.offerValue) || 0;

    switch (formData.offerType) {
      case "PERCENTAGE":
        if (!value) return "N/A";
        const discount = (price * value) / 100;
        return `NPR ${discount.toFixed(2)}`;
      case "FIXED_AMOUNT":
        return value ? `NPR ${value.toFixed(2)}` : "N/A";
      default:
        return "N/A";
    }
  };

  return (
    <div className="space-y-4 p-6 rounded-lg shadow-sm bg-white dark:bg-black">
      {/* Pricing Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Sale Price (NPR)" error={errors.salePrice} required>
            <ValidatedInput
              type="number"
              placeholder="0.00"
              value={formData.salePrice}
              onChange={(e) => updateFormData("salePrice", e.target.value)}
              error={errors.salePrice}
              min="0"
              step="0.01"
              className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </FormField>
          <FormField
            label="Maximum Retail Price (NPR)"
            error={errors.salePrice}
            required
          >
            <ValidatedInput
              type="number"
              placeholder="0.00"
              value={formData.mrp}
              onChange={(e) => updateFormData("mrp", e.target.value)}
              error={errors.mrp}
              min="0"
              step="0.01"
              className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </FormField>
          {/* <div className="grid grid-cols-2 gap-4">
            <FormField label="Sale Start Date" error={errors.saleStart}>
              <ValidatedInput
                type="date"
                value={formData.saleStart}
                onChange={(e) => updateFormData("saleStart", e.target.value)}
                error={errors.saleStart}
                className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </FormField>
            <FormField label="Sale End Date" error={errors.saleEnd}>
              <ValidatedInput
                type="date"
                value={formData.saleEnd}
                onChange={(e) => updateFormData("saleEnd", e.target.value)}
                error={errors.saleEnd}
                className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </FormField>
          </div> */}
        </div>
      </div>

      {/* Inventory Section */}
      <Separator className="bg-gray-200 dark:bg-black" />
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Inventory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="SKU (Stock Keeping Unit)"
            error={errors.sku}
            required
          >
            <ValidatedInput
              placeholder="e.g., ABC-123-XYZ"
              value={formData.sku}
              onChange={(e) => updateFormData("sku", e.target.value)}
              error={errors.sku}
              className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </FormField>
          <FormField label="Stock Quantity" error={errors.stock} required>
            <ValidatedInput
              type="number"
              placeholder="0"
              value={formData.stock}
              onChange={(e) => updateFormData("stock", e.target.value)}
              error={errors.stock}
              min="0"
              className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </FormField>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="trackQuantity"
            checked={formData.trackQuantity}
            onCheckedChange={(checked: boolean) =>
              updateFormData("trackQuantity", checked)
            }
            className="border-gray-300 dark:border-gray-600"
          />
          <Label
            htmlFor="trackQuantity"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Track inventory quantity
          </Label>
        </div>
      </div>

      {/* Offer Section */}
      <Separator className="bg-gray-200 dark:bg-black" />
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Offers
        </h2>
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="hasOffer"
            checked={formData.hasOffer}
            onCheckedChange={(checked: boolean) =>
              updateFormData("hasOffer", checked)
            }
            className="border-gray-300 dark:border-gray-600"
          />
          <Label
            htmlFor="hasOffer"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Enable offer for this product
          </Label>
        </div>

        {formData.hasOffer && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Offer Type" error={errors.offerType} required>
                <Select
                  value={formData.offerType}
                  onValueChange={(val) => updateFormData("offerType", val)}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select offer type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">
                      Fixed Amount (NPR)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Offer Title" error={errors.offerTitle} required>
                <ValidatedInput
                  placeholder="e.g., Diwali Dhamaka Offer"
                  value={formData.offerTitle}
                  onChange={(e) => updateFormData("offerTitle", e.target.value)}
                  error={errors.offerTitle}
                  className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter a descriptive title for the offer
                </p>
              </FormField>

              {/* <FormField
                label="Offer Description"
                error={errors.offerDescription}
              >
                <ValidatedInput
                  placeholder="e.g., Get flat 20% OFF"
                  value={formData.offerDescription}
                  onChange={(e) =>
                    updateFormData("offerDescription", e.target.value)
                  }
                  error={errors.offerDescription}
                  className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Optional description for the offer
                </p>
              </FormField> */}

              {(formData.offerType === "PERCENTAGE" ||
                formData.offerType === "FIXED_AMOUNT") && (
                <FormField
                  label={
                    formData.offerType === "PERCENTAGE"
                      ? "Percentage Value"
                      : "Fixed Amount (NPR)"
                  }
                  error={errors.offerValue}
                  required
                >
                  <ValidatedInput
                    type="number"
                    placeholder={
                      formData.offerType === "PERCENTAGE"
                        ? "e.g., 20"
                        : "e.g., 500"
                    }
                    value={formData.offerValue}
                    onChange={(e) =>
                      updateFormData("offerValue", e.target.value)
                    }
                    error={errors.offerValue}
                    min="0"
                    step={formData.offerType === "PERCENTAGE" ? "1" : "0.01"}
                    max={
                      formData.offerType === "PERCENTAGE" ? "100" : undefined
                    }
                    className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formData.offerType === "PERCENTAGE"
                      ? "Enter percentage (e.g., 20 for 20%)"
                      : "Enter amount in NPR"}
                  </p>
                </FormField>
              )}
              {/* 
              <FormField
                label="Banner Image URL"
                error={errors.offerBannerImage}
              >
                <ValidatedInput
                  placeholder="Optional image URL"
                  value={formData.offerBannerImage}
                  onChange={(e) =>
                    updateFormData("offerBannerImage", e.target.value)
                  }
                  error={errors.offerBannerImage}
                  className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                  <InfoIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                  Optional promotional banner image URL
                </p>
              </FormField> */}

              <FormField label="Start Date" error={errors.offerStart} required>
                <ValidatedInput
                  type="date"
                  value={formData.offerStart}
                  onChange={(e) => updateFormData("offerStart", e.target.value)}
                  error={errors.offerStart}
                  className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
              </FormField>

              <FormField label="End Date" error={errors.offerEnd} required>
                <ValidatedInput
                  type="date"
                  value={formData.offerEnd}
                  onChange={(e) => updateFormData("offerEnd", e.target.value)}
                  error={errors.offerEnd}
                  className="bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
              </FormField>
            </div>

            <div className="p-4 rounded-md bg-gray-100 dark:bg-black">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Offer Preview: {calculateOfferPreview()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This is the estimated offer discount based on the current
                settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
