"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormData, ProductVariantData } from "@/types/pages/product";
import React, { useState, useMemo, useEffect } from "react";
import { SpecificationTable } from "../SpecificationTable";
import {
  Package,
  ShieldCheck,
  RotateCcw,
  Truck,
  Info,
  Star,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ProductPreview = React.memo(
  ({ formData }: { formData: FormData }) => {
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    // State for attribute selection
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    // Initialize selected attributes with default variant or first variant
    useEffect(() => {
      if (formData.hasVariants && formData.variants.length > 0) {
        const defaultVar = formData.variants.find(v => v.isDefault) || formData.variants[0];
        setSelectedAttributes(defaultVar.attributes);
      }
    }, [formData.hasVariants, formData.variants]);

    // Find the currently active variant based on selection
    const activeVariant = useMemo(() => {
      if (!formData.hasVariants) return null;
      return formData.variants.find(v =>
        Object.entries(selectedAttributes).every(([key, value]) => v.attributes[key] === value)
      );
    }, [formData.hasVariants, formData.variants, selectedAttributes]);

    // Combine all media
    const allMedia = [...formData.productMedia, ...formData.promotionalMedia];
    const currentMedia = allMedia[activeMediaIndex] || allMedia[0];

    // Use variant price if available, otherwise base price
    const currentPriceStr = activeVariant ? activeVariant.price : formData.price;
    const currentMrpStr = activeVariant ? activeVariant.mrp : formData.mrp;
    const currentSku = activeVariant ? activeVariant.sku : formData.sku;
    const currentStock = activeVariant ? activeVariant.stock : formData.stock;

    const price = parseFloat(currentPriceStr || "0");
    const mrp = parseFloat(currentMrpStr || "0");
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    // Determine which specifications to show (variant-specific or global)
    const displaySpecs = (activeVariant?.specifications && activeVariant.specifications.length > 0)
      ? activeVariant.specifications
      : formData.specifications;

    const displaySpecTable = (activeVariant?.specificationTable)
      ? activeVariant.specificationTable
      : formData.specificationTable;

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 px-4 rounded-full w-fit">
          <span>Home</span> <ChevronRight className="w-3 h-3" />
          <span>{formData.categoryId || "Category"}</span> <ChevronRight className="w-3 h-3" />
          <span className="text-primary font-medium">{formData.name || "Product Name"}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Media Gallery */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-4">
            <Card className="overflow-hidden border-none shadow-xl bg-muted/10 group">
              <div className="relative aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center bg-background/50">
                {currentMedia ? (
                  currentMedia.fileType === "IMAGE" ? (
                    <img
                      src={currentMedia.url}
                      alt={currentMedia.altText || "Product preview"}
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={currentMedia.url}
                      controls
                      className="max-w-full max-h-full object-contain"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                    <ShoppingBag className="w-20 h-20" />
                    <p>No media uploaded</p>
                  </div>
                )}

                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 text-sm shadow-lg">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
            </Card>

            {/* Thumbnails */}
            {allMedia.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {allMedia.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={cn(
                      "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-muted/20",
                      activeMediaIndex === idx
                        ? "border-primary shadow-md ring-2 ring-primary/20 scale-105"
                        : "border-transparent opacity-80 hover:opacity-100"
                    )}
                  >
                    <img
                      src={media.url}
                      alt={`Thumb ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    {media.fileType === "VIDEO" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="bg-white/90 rounded-full p-1">
                          <ExternalLink className="w-3 h-3 text-black" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Info Selection */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider text-[10px] font-bold">
                    {formData.brand || "Generic"}
                  </Badge>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                    <span className="text-[10px] text-muted-foreground ml-1">(5.0)</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {formData.name || "Untitled Product"}
                </h1>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border/50 transition-all duration-300">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-primary">
                    NPR {price.toLocaleString()}
                  </span>
                  {mrp > price && (
                    <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                      NPR {mrp.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Prices inclusive of all taxes</p>
              </div>

              {/* Variant Selectors (Clickable for Interactive Preview) */}
              {formData.hasVariants && formData.attributes.map((attr, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold uppercase tracking-wide">{attr.name}</Label>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full ring-1 ring-primary/20">Selected: {selectedAttributes[attr.name]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((val, vIdx) => {
                      const isSelected = selectedAttributes[attr.name] === val;
                      return (
                        <button
                          key={vIdx}
                          onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.name]: val }))}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm border-2 transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 text-primary font-bold shadow-sm scale-105"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Separator className="bg-border/50" />

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Shipping</p>
                    <p className="text-[12px] font-medium leading-tight">
                      {formData.shippingMethod || "Standard Delivery"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Warranty</p>
                    <p className="text-[12px] font-medium leading-tight">
                      {formData.warrantyDuration ? `${formData.warrantyDuration} ${formData.warrantyUnit}` : "No Warranty"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-dashed border-primary/30">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full animate-pulse", Number(currentStock) > 0 ? "bg-green-500" : "bg-red-500")} />
                  <span className="text-sm font-bold">{Number(currentStock) > 0 ? `In Stock (${currentStock})` : "Out of Stock"}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  SKU: <span className="text-foreground">{currentSku || "N/A"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Tabs for Details */}
        <Card className="border-none shadow-lg overflow-hidden bg-background">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start rounded-none h-14 bg-muted/30 border-b p-0 overflow-x-auto no-scrollbar">
              <TabsTrigger
                value="description"
                className="rounded-none h-full px-8 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-sm font-bold uppercase tracking-wider flex-shrink-0"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none h-full px-8 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-sm font-bold uppercase tracking-wider flex-shrink-0"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="policies"
                className="rounded-none h-full px-8 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-sm font-bold uppercase tracking-wider flex-shrink-0"
              >
                Policies
              </TabsTrigger>
            </TabsList>

            <CardContent className="p-8">
              <TabsContent value="description" className="m-0 focus-visible:ring-0">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Info className="w-5 h-5" />
                    <h3 className="text-lg font-bold">About this product</h3>
                  </div>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {formData.description || "No description provided for this product."}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="m-0 focus-visible:ring-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Package className="w-5 h-5" />
                      <h3 className="text-lg font-bold">Technical Specifications</h3>
                    </div>
                    {activeVariant && (
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">Viewing: {Object.values(activeVariant.attributes).join(" / ")}</Badge>
                    )}
                  </div>

                  {(displaySpecs.length > 0 || displaySpecTable) ? (
                    displaySpecTable ? (
                      <div className="border rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm transition-all duration-500">
                        <SpecificationTable data={displaySpecTable} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 animate-in slide-in-from-bottom-2 duration-500">
                        {displaySpecs
                          .filter((spec) => spec.key && spec.value)
                          .map((spec, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-border/50 group hover:bg-muted/10 transition-colors px-2 rounded-lg">
                              <span className="text-sm text-muted-foreground font-medium">{spec.key}</span>
                              <span className="text-sm font-bold text-foreground">{spec.value}</span>
                            </div>
                          ))}
                      </div>
                    )
                  ) : (
                    <p className="text-muted-foreground text-center py-12 italic bg-muted/10 rounded-2xl border border-dashed">
                      No technical specifications added.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="policies" className="m-0 focus-visible:ring-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Shipping Info */}
                  <div className="space-y-4 bg-muted/10 p-6 rounded-3xl border border-border/50">
                    <div className="flex items-center gap-3 text-primary">
                      <Truck className="w-6 h-6" />
                      <h4 className="font-bold">Shipping & Delivery</h4>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-bold">{formData.weight ? `${formData.weight} kg` : "N/A"}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fragile</span>
                        <span className={cn("font-bold px-2 py-0.5 rounded-full text-[10px] uppercase", formData.isFragile ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                          {formData.isFragile ? "Yes" : "No"}
                        </span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Carrier</span>
                        <span className="font-bold">{formData.carrier || "Any"}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Return & Warranty */}
                  <div className="space-y-4 bg-muted/10 p-6 rounded-3xl border border-border/50">
                    <div className="flex items-center gap-3 text-primary">
                      <RotateCcw className="w-6 h-6" />
                      <h4 className="font-bold">Return & Warranty</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Return Policy</p>
                        <p className="text-sm font-medium leading-relaxed">
                          {formData.returnType === "NO_RETURN" ? "No returns accepted" : `${formData.returnDuration} ${formData.returnUnit} return policy`}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Refund Conditions</p>
                        <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">
                          {formData.returnConditions || "Please check with seller for return conditions."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    );
  }
);

ProductPreview.displayName = "ProductPreview";
