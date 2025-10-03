import {
  FormField,
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "@/components/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import { Errors, FormData } from "@/types/pages/product";
import { Info, Package, Shield, Truck } from "lucide-react";
import React from "react";

interface ShippingStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
}

export const ShippingStep = React.memo(
  ({ formData, errors, updateFormData }: ShippingStepProps) => {
    // Helper to calculate shipping estimates
    const getEstimatedDelivery = (method: string) => {
      const estimates = {
        STANDARD: "5-7 business days",
        EXPRESS: "2-3 business days",
        OVERNIGHT: "Next business day",
        SAME_DAY: "Same day (if ordered before 12 PM)",
      };
      return estimates[method as keyof typeof estimates] || "";
    };

    // Nepal provinces for free delivery
    const nepalProvinces = [
      "Province No. 1",
      "Madhesh Province",
      "Bagmati Province",
      "Gandaki Province",
      "Lumbini Province",
      "Karnali Province",
      "Sudurpashchim Province",
    ];

    const units = ["days", "months", "years"];

    return (
      <div className="space-y-6">
        {/* Package Details Section */}
        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-100 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Package Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Weight" error={errors.weight}>
              <div className="relative">
                <ValidatedInput
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData("weight", e.target.value)
                  }
                  error={errors.weight}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  kg
                </span>
              </div>
            </FormField>

            <FormField label="Length">
              <div className="relative">
                <ValidatedInput
                  type="number"
                  placeholder="0"
                  value={formData.length}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData("length", e.target.value)
                  }
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  cm
                </span>
              </div>
            </FormField>

            <FormField label="Width">
              <div className="relative">
                <ValidatedInput
                  type="number"
                  placeholder="0"
                  value={formData.width}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData("width", e.target.value)
                  }
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  cm
                </span>
              </div>
            </FormField>

            <FormField label="Height">
              <div className="relative">
                <ValidatedInput
                  type="number"
                  placeholder="0"
                  value={formData.height}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData("height", e.target.value)
                  }
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  cm
                </span>
              </div>
            </FormField>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.isFragile}
                onCheckedChange={(checked) =>
                  updateFormData("isFragile", checked)
                }
              />
              <span className="text-sm">
                Fragile item (requires special handling)
              </span>
            </label>
          </div>
        </div>

        {/* Shipping Options Section */}
        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-100 mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipping Options
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Shipping Method">
              <ValidatedSelect
                value={formData.shippingMethod}
                onValueChange={(value: string) => {
                  updateFormData("shippingMethod", value);
                  updateFormData(
                    "estimatedDelivery",
                    getEstimatedDelivery(value)
                  );
                }}
                placeholder="Select shipping method"
              >
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="EXPRESS">Express</SelectItem>
                <SelectItem value="OVERNIGHT">Overnight</SelectItem>
                <SelectItem value="SAME_DAY">Same Day</SelectItem>
              </ValidatedSelect>
            </FormField>

            <FormField label="Free Delivery Options">
              <ValidatedSelect
                value={formData.freeDeliveryOption}
                onValueChange={(value: string) =>
                  updateFormData("freeDeliveryOption", value)
                }
                placeholder="Select free delivery option"
              >
                <SelectItem value="none">No free delivery</SelectItem>
                <SelectItem value="all_nepal">
                  Free delivery across Nepal
                </SelectItem>
                <SelectItem value="selected_provinces">
                  Free delivery in selected provinces
                </SelectItem>
              </ValidatedSelect>
            </FormField>

            {formData.freeDeliveryOption === "selected_provinces" && (
              <FormField label="Select Provinces for Free Delivery">
                <div className="space-y-2">
                  {nepalProvinces.map((province) => (
                    <label
                      key={province}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.freeDeliveryProvinces?.includes(
                          province
                        )}
                        onCheckedChange={(checked) => {
                          const currentProvinces =
                            formData.freeDeliveryProvinces || [];
                          const updatedProvinces = checked
                            ? [...currentProvinces, province]
                            : currentProvinces.filter((p) => p !== province);
                          updateFormData(
                            "freeDeliveryProvinces",
                            updatedProvinces
                          );
                        }}
                      />
                      <span className="text-sm">{province}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            )}
          </div>

          {formData.estimatedDelivery && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Estimated Delivery Time</p>
                <p>{formData.estimatedDelivery}</p>
              </div>
            </div>
          )}
        </div>

        {/* Return Policy Section */}
        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-100 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Return Policy
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Return Type">
                <ValidatedSelect
                  value={formData.returnType}
                  onValueChange={(value: string) =>
                    updateFormData("returnType", value)
                  }
                  placeholder="Select return type"
                >
                  <SelectItem value="NO_RETURN">No Return</SelectItem>
                  <SelectItem value="REPLACEMENT">Replacement</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                  <SelectItem value="REPLACEMENT_OR_REFUND">
                    Replacement or Refund
                  </SelectItem>
                </ValidatedSelect>
              </FormField>

              <FormField label="Duration">
                <div className="relative">
                  <ValidatedInput
                    type="number"
                    placeholder="0"
                    value={formData.returnDuration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateFormData("returnDuration", e.target.value)
                    }
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {formData.returnUnit || ""}
                  </span>
                </div>
              </FormField>

              <FormField label="Unit">
                <ValidatedSelect
                  value={formData.returnUnit}
                  onValueChange={(value: string) =>
                    updateFormData("returnUnit", value)
                  }
                  placeholder="Select unit"
                >
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </ValidatedSelect>
              </FormField>
            </div>

            <FormField label="Conditions">
              <ValidatedTextarea
                placeholder="e.g., Valid only if unused and in original packaging"
                value={formData.returnConditions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateFormData("returnConditions", e.target.value)
                }
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify conditions for returns
              </p>
            </FormField>
          </div>
        </div>

        {/* Warranty Section */}
        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-100 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Warranty
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Warranty Type">
                <ValidatedSelect
                  value={formData.warrantyType}
                  onValueChange={(value: string) =>
                    updateFormData("warrantyType", value)
                  }
                  placeholder="Select warranty type"
                >
                  <SelectItem value="MANUFACTURER">Manufacturer</SelectItem>
                  <SelectItem value="SELLER">Seller</SelectItem>
                  <SelectItem value="NO_WARRANTY">No Warranty</SelectItem>
                </ValidatedSelect>
              </FormField>

              <FormField label="Duration">
                <div className="relative">
                  <ValidatedInput
                    type="number"
                    placeholder="0"
                    value={formData.warrantyDuration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateFormData("warrantyDuration", e.target.value)
                    }
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {formData.warrantyUnit || ""}
                  </span>
                </div>
              </FormField>

              <FormField label="Unit">
                <ValidatedSelect
                  value={formData.warrantyUnit}
                  onValueChange={(value: string) =>
                    updateFormData("warrantyUnit", value)
                  }
                  placeholder="Select unit"
                >
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </ValidatedSelect>
              </FormField>
            </div>

            <FormField label="Description">
              <ValidatedTextarea
                placeholder="e.g., 1 Year Manufacturer Warranty covering manufacturing defects"
                value={formData.warrantyDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateFormData("warrantyDescription", e.target.value)
                }
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify what the warranty covers
              </p>
            </FormField>
          </div>
        </div>
      </div>
    );
  }
);

ShippingStep.displayName = "ShippingStep";
