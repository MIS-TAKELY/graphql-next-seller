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
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  useEffect(() => {
    if (!formData.hasVariants) return;

    const combinations = generateCombinations(formData.attributes);

    const newVariants: ProductVariantData[] = combinations.map(
      (combo, index) => {
        const existing = formData.variants.find(
          (v) => JSON.stringify(v.attributes) === JSON.stringify(combo)
        );

        return (
          existing || {
            id: undefined,
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toggle: Simple vs Variable Product */}
      <Card className="overflow-hidden border-none bg-muted/30">
        <div className="flex items-center justify-between p-6 bg-background/50 backdrop-blur-sm">
          <div className="space-y-1">
            <Label className="text-lg font-bold">Product Type</Label>
            <p className="text-sm text-muted-foreground">
              Does this product have multiple options like Size or Color?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("text-sm font-medium transition-colors", !formData.hasVariants ? "text-primary" : "text-muted-foreground")}>Simple</span>
            <Switch
              checked={formData.hasVariants}
              onCheckedChange={(checked) => updateFormData("hasVariants", checked)}
              className="data-[state=checked]:bg-primary"
            />
            <span className={cn("text-sm font-medium transition-colors", formData.hasVariants ? "text-primary" : "text-muted-foreground")}>Variable</span>
          </div>
        </div>
      </Card>

      {/* SECTION A: NO VARIANTS (Simple Product) */}
      {!formData.hasVariants && (
        <Card className="border-none bg-muted/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField label="Sale Price (NPR)" error={errors.price} required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">Rs.</span>
                  <ValidatedInput
                    type="number"
                    className="pl-10"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                  />
                </div>
              </FormField>
              <FormField label="MRP (NPR)" error={errors.mrp} required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">Rs.</span>
                  <ValidatedInput
                    type="number"
                    className="pl-10"
                    placeholder="0.00"
                    value={formData.mrp}
                    onChange={(e) => updateFormData("mrp", e.target.value)}
                  />
                </div>
              </FormField>
              <FormField label="Stock Quantity" error={errors.stock} required>
                <ValidatedInput
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.stock}
                  onChange={(e) => updateFormData("stock", e.target.value)}
                />
              </FormField>
              <FormField label="SKU ID" error={errors.sku} required>
                <ValidatedInput
                  placeholder="e.g. PRD-001"
                  value={formData.sku}
                  onChange={(e) => updateFormData("sku", e.target.value)}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION B: VARIANTS (Complex Product) */}
      {formData.hasVariants && (
        <div className="space-y-8">
          {/* 1. Attribute Builder */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Product Attributes</CardTitle>
                  <CardDescription>Define the variations for your product</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-2">
                  <Label>Attribute Name</Label>
                  <Input
                    placeholder="e.g. Size, Color, Material"
                    value={attrName}
                    onChange={(e) => setAttrName(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-[10px] text-muted-foreground">The name of the attribute customers will see.</p>
                </div>
                <div className="md:col-span-6 space-y-2">
                  <Label>Values</Label>
                  <div className="relative">
                    <Input
                      placeholder="e.g. Small, Medium (Press Enter or use comma)"
                      value={attrValue}
                      onChange={(e) => setAttrValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addValue();
                        }
                      }}
                      className="h-11 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-9 w-9 p-0"
                      onClick={addValue}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  {/* Pending Values Chips */}
                  {currentValues.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-top-1">
                      {currentValues.map((val, i) => (
                        <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1 gap-1 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                          {val}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full hover:bg-destructive hover:text-white"
                            onClick={() => setCurrentValues((prev) => prev.filter((_, idx) => idx !== i))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 pt-8">
                  <Button
                    type="button"
                    className="w-full h-11"
                    onClick={addAttribute}
                    disabled={!attrName || currentValues.length === 0}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {formData.attributes.length > 0 && (
                <div className="pt-4 border-t space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Currently Added Attributes</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.attributes.map((attr, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border group hover:border-primary/50 transition-all"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-primary">{attr.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {attr.values.map((v, idx) => (
                              <span key={idx} className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border">
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => removeAttribute(i)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Generated Variants Table */}
          {formData.variants.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg">Generated Variants</CardTitle>
                  <CardDescription>We've created {formData.variants.length} combinations</CardDescription>
                </div>
                {formData.variants.length > 1 && (
                  <div className="hidden md:flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground px-2">Fill All:</span>
                    <Button variant="outline" size="sm" onClick={() => applyToAll("price")} className="h-7 text-[10px] gap-1 px-2">
                      <Copy className="w-3 h-3 text-primary" /> Price
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyToAll("mrp")} className="h-7 text-[10px] gap-1 px-2">
                      <Copy className="w-3 h-3 text-primary" /> MRP
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyToAll("stock")} className="h-7 text-[10px] gap-1 px-2">
                      <Copy className="w-3 h-3 text-primary" /> Stock
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 border-t">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow>
                        <TableHead className="w-[200px] font-bold">Variant</TableHead>
                        <TableHead className="font-bold">Price (NPR)</TableHead>
                        <TableHead className="font-bold">MRP (NPR)</TableHead>
                        <TableHead className="font-bold">SKU ID</TableHead>
                        <TableHead className="font-bold">Stock</TableHead>
                        <TableHead className="w-[80px] font-bold text-center">Default</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.variants.map((variant, index) => (
                        <TableRow key={index} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(variant.attributes).map(([key, val], i) => (
                                <Badge key={i} variant="outline" className="text-[10px] font-normal px-2 py-0 border-primary/20">
                                  {key}: {val}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative group/input max-w-[120px]">
                              <Input
                                type="number"
                                className="h-9 focus-visible:ring-primary pl-1 transition-all"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, "price", e.target.value)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative max-w-[120px]">
                              <Input
                                type="number"
                                className="h-9 focus-visible:ring-primary pl-1 transition-all"
                                value={variant.mrp}
                                onChange={(e) => updateVariant(index, "mrp", e.target.value)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative max-w-[160px]">
                              <Input
                                className="h-9 font-mono text-xs focus-visible:ring-primary transition-all"
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative max-w-[100px]">
                              <Input
                                type="number"
                                className="h-9 focus-visible:ring-primary pl-1 transition-all"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, "stock", e.target.value)}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={variant.isDefault}
                              onCheckedChange={() => {
                                const updated = formData.variants.map((v, i) => ({
                                  ...v,
                                  isDefault: i === index,
                                }));
                                updateFormData("variants", updated);
                              }}
                              className="scale-75 data-[state=checked]:bg-primary"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
