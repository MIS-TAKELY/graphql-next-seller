// components/product/steps/VariantsStep.tsx
"use client";

import { FormField, ValidatedInput } from "@/components/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FormData,
  ProductAttribute,
  ProductVariantData,
} from "@/types/pages/product";
import { Copy, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VariantsStepProps {
  formData: FormData;
  errors: any;
  updateFormData: (field: keyof FormData, value: any) => void;
}

export const VariantsStep = ({
  formData,
  errors,
  updateFormData,
}: VariantsStepProps) => {
  const [attrName, setAttrName] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [currentValues, setCurrentValues] = useState<string[]>([]);

  // 1. Helper: Generate combinations from attributes
  const generateCombinations = (attributes: ProductAttribute[]) => {
    if (attributes.length === 0) return [];

    const generate = (
      index: number,
      current: Record<string, string>
    ): Record<string, string>[] => {
      if (index === attributes.length) return [current];

      const attribute = attributes[index];
      const combinations: Record<string, string>[] = [];

      attribute.values.forEach((val) => {
        combinations.push(
          ...generate(index + 1, { ...current, [attribute.name]: val })
        );
      });

      return combinations;
    };

    return generate(0, {});
  };

  // 2. Effect: Re-generate variants when attributes change
  // Note: In a real app, you might want to preserve existing prices if the key matches
  useEffect(() => {
    if (!formData.hasVariants) return;

    const combinations = generateCombinations(formData.attributes);

    const newVariants: ProductVariantData[] = combinations.map(
      (combo, index) => {
        // Try to find existing variant to preserve data
        const existing = formData.variants.find(
          (v) => JSON.stringify(v.attributes) === JSON.stringify(combo)
        );

        return (
          existing || {
            id: undefined, // New variant
            sku: `${formData.sku ? formData.sku + "-" : ""}${Object.values(
              combo
            )
              .join("-")
              .toUpperCase()}`,
            price: formData.price || "",
            mrp: formData.mrp || "",
            stock: formData.stock || "",
            attributes: combo,
            isDefault: index === 0,
          }
        );
      }
    );

    updateFormData("variants", newVariants);
  }, [formData.attributes, formData.hasVariants]);

  // 3. Handlers for Attributes
  const addValue = () => {
    if (attrValue.trim()) {
      // Split by comma, trim, and filter out empty strings
      const valuesToAdd = attrValue
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "" && !currentValues.includes(v));

      if (valuesToAdd.length > 0) {
        setCurrentValues([...currentValues, ...valuesToAdd]);
        setAttrValue("");
      }
    }
  };

  const addAttribute = () => {
    if (attrName.trim() && currentValues.length > 0) {
      const newAttr = { name: attrName, values: currentValues };
      updateFormData("attributes", [...formData.attributes, newAttr]);
      setAttrName("");
      setCurrentValues([]);
      setAttrValue("");
    }
  };

  const removeAttribute = (index: number) => {
    const newAttrs = [...formData.attributes];
    newAttrs.splice(index, 1);
    updateFormData("attributes", newAttrs);
  };

  // 4. Handlers for Variant Row Editing
  const updateVariant = (
    index: number,
    field: keyof ProductVariantData,
    value: any
  ) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };

    // Auto-fill MRP if empty and price changes
    if (field === "price" && !newVariants[index].mrp) {
      newVariants[index].mrp = value;
    }

    updateFormData("variants", newVariants);
  };

  const applyToAll = (field: keyof ProductVariantData) => {
    if (formData.variants.length <= 1) return;
    const firstVal = formData.variants[0][field];
    const updated = formData.variants.map((v) => ({
      ...v,
      [field]: firstVal,
    }));
    updateFormData("variants", updated);
    toast.success(`Applied first variant's ${field} to all others!`);
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toggle: Simple vs Variable Product */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <Label className="text-base">Multiple Variants</Label>
          <p className="text-sm text-muted-foreground">
            Does this product have options like Size or Color?
          </p>
        </div>
        <Switch
          checked={formData.hasVariants}
          onCheckedChange={(checked) => updateFormData("hasVariants", checked)}
        />
      </div>

      {/* SECTION A: NO VARIANTS (Simple Product) */}
      {!formData.hasVariants && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
          <FormField label="Price (NPR)" error={errors.price} required>
            <ValidatedInput
              type="number"
              value={formData.price}
              onChange={(e) => updateFormData("price", e.target.value)}
            />
          </FormField>
          <FormField label="MRP (NPR)" error={errors.mrp} required>
            <ValidatedInput
              type="number"
              value={formData.mrp}
              onChange={(e) => updateFormData("mrp", e.target.value)}
            />
          </FormField>
          <FormField label="SKU" error={errors.sku} required>
            <ValidatedInput
              value={formData.sku}
              onChange={(e) => updateFormData("sku", e.target.value)}
            />
          </FormField>
          <FormField label="Stock" error={errors.stock} required>
            <ValidatedInput
              type="number"
              value={formData.stock}
              onChange={(e) => updateFormData("stock", e.target.value)}
            />
          </FormField>
        </div>
      )}

      {/* SECTION B: VARIANTS (Complex Product) */}
      {formData.hasVariants && (
        <div className="space-y-6">
          {/* 1. Attribute Builder */}
          <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Define Attributes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Attribute Name</Label>
                <Input
                  placeholder="e.g. Size, Color"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Values (Press Enter)</Label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Red, Blue"
                    value={attrValue}
                    onChange={(e) => setAttrValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addValue();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7"
                    onClick={addValue}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 italic">
                  Tip: Enter comma-separated values (e.g. Red, Blue, Green) to add multiple at once.
                </p>
              </div>
              <Button
                type="button"
                onClick={addAttribute}
                disabled={!attrName || currentValues.length === 0}
              >
                Add Attribute
              </Button>
            </div>

            {/* Pending Values Chips */}
            {currentValues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentValues.map((val, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1">
                    {val}{" "}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() =>
                        setCurrentValues((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                    />
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* List of Added Attributes */}
            <div className="space-y-2">
              {formData.attributes.map((attr, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-background p-3 rounded border"
                >
                  <div>
                    <span className="font-semibold">{attr.name}:</span>
                    <span className="ml-2 text-muted-foreground">
                      {attr.values.join(", ")}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeAttribute(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Generated Variants Table */}
          {formData.variants.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        Price (NPR)
                        <button
                          type="button"
                          onClick={() => applyToAll("price")}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Apply first variant's price to all"
                        >
                          <Copy className="w-3 h-3 text-primary" />
                        </button>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        MRP (NPR)
                        <button
                          type="button"
                          onClick={() => applyToAll("mrp")}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Apply first variant's MRP to all"
                        >
                          <Copy className="w-3 h-3 text-primary" />
                        </button>
                      </div>
                    </TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        Stock
                        <button
                          type="button"
                          onClick={() => applyToAll("stock")}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Apply first variant's stock to all"
                        >
                          <Copy className="w-3 h-3 text-primary" />
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="w-[50px]">Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.variants.map((variant, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {Object.values(variant.attributes).join(" / ")}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 h-8"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 h-8"
                          value={variant.mrp}
                          onChange={(e) =>
                            updateVariant(index, "mrp", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="w-32 h-8"
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariant(index, "sku", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20 h-8"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(index, "stock", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={variant.isDefault}
                          onCheckedChange={() => {
                            // Set only this one to true, others false
                            const updated = formData.variants.map((v, i) => ({
                              ...v,
                              isDefault: i === index,
                            }));
                            updateFormData("variants", updated);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
