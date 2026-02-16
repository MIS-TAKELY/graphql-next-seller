// components/product/steps/ShippingStep.tsx
"use client";

import React from "react";
import { FormField, ValidatedInput, ValidatedSelect, ValidatedTextarea } from "@/components/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { Package, Shield, Truck, Plus, Trash2 } from "lucide-react";
import { FormData } from "@/types/pages/product";

interface ShippingStepProps {
  formData: FormData;
  errors: any;
  updateFormData: (field: keyof FormData, value: any) => void;
}

export const ShippingStep = React.memo(({ formData, errors, updateFormData }: ShippingStepProps) => {

  // Helper to manage delivery options array
  const addDeliveryOption = () => {
    updateFormData("deliveryOptions", [
      ...formData.deliveryOptions,
      { title: "", description: "" }
    ]);
  };

  const updateDeliveryOption = (index: number, field: string, val: string) => {
    const newOptions = [...formData.deliveryOptions];
    newOptions[index] = { ...newOptions[index], [field]: val };
    updateFormData("deliveryOptions", newOptions);
  };

  const removeDeliveryOption = (index: number) => {
    const newOptions = [...formData.deliveryOptions];
    newOptions.splice(index, 1);
    updateFormData("deliveryOptions", newOptions);
  };

  return (
    <div className="space-y-6">

      {/* 1. Physical Dimensions */}
      <div className="p-4 border rounded-lg bg-background">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Package className="w-4 h-4" /> Package Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField label="Weight (kg)" error={errors.weight}>
            <ValidatedInput
              type="number" step="0.1"
              value={formData.weight}
              onChange={(e) => updateFormData("weight", e.target.value)}
            />
          </FormField>
          <FormField label="Length (cm)">
            <ValidatedInput type="number" value={formData.length} onChange={(e) => updateFormData("length", e.target.value)} />
          </FormField>
          <FormField label="Width (cm)">
            <ValidatedInput type="number" value={formData.width} onChange={(e) => updateFormData("width", e.target.value)} />
          </FormField>
          <FormField label="Height (cm)">
            <ValidatedInput type="number" value={formData.height} onChange={(e) => updateFormData("height", e.target.value)} />
          </FormField>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={formData.isFragile} onCheckedChange={(c) => updateFormData("isFragile", c)} />
            <span className="text-sm">Fragile (Special handling required)</span>
          </label>
        </div>
        <div className="mt-4 pt-4 border-t">
          <FormField label="Delivery Charge (NPR)" error={errors.deliveryCharge}>
            <ValidatedInput
              type="number"
              placeholder="0 (Free Delivery)"
              value={formData.deliveryCharge}
              onChange={(e) => updateFormData("deliveryCharge", e.target.value)}
            />
          </FormField>
          <p className="text-xs text-muted-foreground mt-1">
            Setting this to 0 will mark the product as "Free Delivery".
          </p>
        </div>
      </div>

      {/* 2. Delivery Options (One-to-Many) */}
      <div className="p-4 border rounded-lg bg-background">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4" /> Delivery Options
        </h3>
        <div className="space-y-3">
          {formData.deliveryOptions.map((option, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <ValidatedInput
                  placeholder="Title (e.g. Express)"
                  value={option.title}
                  onChange={(e) => updateDeliveryOption(idx, 'title', e.target.value)}
                />
                <ValidatedInput
                  placeholder="Desc (e.g. 1-2 days)"
                  value={option.description || ""}
                  onChange={(e) => updateDeliveryOption(idx, 'description', e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeDeliveryOption(idx)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addDeliveryOption}>
            <Plus className="w-4 h-4 mr-2" /> Add Delivery Method
          </Button>
        </div>
      </div>

      {/* 3. Warranty (Schema Enum: MANUFACTURER, SELLER, NO_WARRANTY) */}
      <div className="p-4 border rounded-lg bg-background">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Warranty
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Type">
            <ValidatedSelect value={formData.warrantyType} onValueChange={(v) => updateFormData("warrantyType", v)}>
              <SelectItem value="MANUFACTURER">Manufacturer Warranty</SelectItem>
              <SelectItem value="SELLER">Seller Warranty</SelectItem>
              <SelectItem value="NO_WARRANTY">No Warranty</SelectItem>
            </ValidatedSelect>
          </FormField>
          {formData.warrantyType !== "NO_WARRANTY" && (
            <>
              <FormField label="Duration">
                <div className="flex gap-2">
                  <ValidatedInput
                    type="number"
                    value={formData.warrantyDuration}
                    onChange={(e) => updateFormData("warrantyDuration", e.target.value)}
                    className="w-20"
                  />
                  <ValidatedSelect
                    value={formData.warrantyUnit}
                    onValueChange={(v) => updateFormData("warrantyUnit", v)}
                  >
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </ValidatedSelect>
                </div>
              </FormField>
              <FormField label="Description">
                <ValidatedInput
                  placeholder="e.g. Covers motor only"
                  value={formData.warrantyDescription}
                  onChange={(e) => updateFormData("warrantyDescription", e.target.value)}
                />
              </FormField>
            </>
          )}
        </div>
      </div>

      {/* 4. Return Policy (Schema Enum) */}
      <div className="p-4 border rounded-lg bg-background">
        <h3 className="text-lg font-medium mb-4">Return Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Type">
            <ValidatedSelect value={formData.returnType} onValueChange={(v) => updateFormData("returnType", v)}>
              <SelectItem value="NO_RETURN">No Returns</SelectItem>
              <SelectItem value="REPLACEMENT">Replacement Only</SelectItem>
              <SelectItem value="REFUND">Refund Only</SelectItem>
              <SelectItem value="REPLACEMENT_OR_REFUND">Replacement or Refund</SelectItem>
            </ValidatedSelect>
          </FormField>
          {formData.returnType !== "NO_RETURN" && (
            <FormField label="Return Period (Days)">
              <ValidatedInput
                type="number"
                value={formData.returnDuration}
                onChange={(e) => updateFormData("returnDuration", e.target.value)}
              />
            </FormField>
          )}
        </div>
        {formData.returnType !== "NO_RETURN" && (
          <div className="mt-4">
            <FormField label="Conditions">
              <ValidatedTextarea
                placeholder="e.g. Item must be unused and in original packaging."
                value={formData.returnConditions}
                onChange={(e) => updateFormData("returnConditions", e.target.value)}
              />
            </FormField>
          </div>
        )}
      </div>

    </div>
  );
});