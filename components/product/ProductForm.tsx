// app/products/add/page.tsx (or wherever ProductForm is)
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Components
import { FormNavigation } from "@/components/product/FormNavigation";
import { BasicDetailsStep } from "@/components/product/steps/BasicDetailsStep";
import { MediaStep } from "@/components/product/steps/MediaStep";
import { ProductPreview } from "@/components/product/steps/ProductPreview";
import { ShippingStep } from "@/components/product/steps/ShippingStep";
import { SpecificationsStep } from "@/components/product/steps/SpecificationsStep";
import { VariantsStep } from "@/components/product/steps/VariantsStep"; // NEW
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DiscountType,
  ProductStatus,
  ReturnType,
  WarrantyType,
} from "@/types/common/enums";
import { FormData } from "@/types/pages/product";
import { buildProductInput, validateStep } from "@/utils/product/validateSteps";

// Enums are imported from types

interface Props {
  mode: "create" | "edit" | "add";
  categoriesData?: any;
  initialValues?: FormData;
  onSubmit: (input: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
  title?: string;
  subtitle?: string;
}

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Technical details" },
  { id: 3, title: "Variants & Pricing", description: "Price, Stock & Options" }, // Renamed
  { id: 4, title: "Media", description: "Images and videos" },
  { id: 5, title: "Shipping & Policies", description: "Delivery & Warranty" },
  { id: 6, title: "Preview", description: "Review & finalize" },
];

export function ProductForm({
  mode,
  categoriesData,
  initialValues,
  onSubmit,
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>(
    initialValues || {
      name: "",
      description: "",
      categoryId: "",
      subcategory: "",
      subSubcategory: "",
      brand: "",
      status: ProductStatus.DRAFT,

      // Specs
      specifications: [],
      specificationDisplayFormat: "bullet",

      // Variants
      hasVariants: false,
      attributes: [], // e.g. [{name: 'Color', values: ['Red', 'Blue']}]
      variants: [], // Generated combinations
      price: "", // Fallback for no variants
      mrp: "",
      sku: "",
      stock: 0,

      // Media
      productMedia: [],
      promotionalMedia: [],

      // Shipping
      weight: 0,
      length: "",
      width: "",
      height: "",
      isFragile: false,
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "3-5 Business Days",
          isDefault: true,
        },
      ],

      // Policies
      returnType: ReturnType.NO_RETURN,
      returnDuration: "",
      returnUnit: "days",
      returnConditions: "",

      warrantyType: WarrantyType.NO_WARRANTY,
      warrantyDuration: "",
      warrantyUnit: "months",
      warrantyDescription: "",

      // Offers
      hasOffer: false,
      offerType: DiscountType.PERCENTAGE,
      offerTitle: "",
      offerValue: "",
      offerStart: "",
      offerEnd: "",
    }
  );

  const [errors, setErrors] = useState<any>({});
  const parama = useParams();
  const productId = parama.id as string;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const allErrors: Record<number, any> = {};
    let firstErrorStep = null;

    // Validate all steps and collect errors per step
    for (let i = 1; i <= steps.length; i++) {
      const stepErrors: any = {};
      const isValid = validateStep(i, formData, (errors) => {
        Object.assign(stepErrors, errors);
      });

      if (!isValid) {
        allErrors[i] = stepErrors;
        if (!firstErrorStep) firstErrorStep = i;
      }
    }

    if (Object.keys(allErrors).length > 0) {
      // Set all errors at once
      setErrors((prev: Record<string, string | undefined>) => ({
        ...prev,
        ...Object.values(allErrors).reduce((a, b) => ({ ...a, ...b }), {}),
      }));

      // Jump to first invalid step
      if (firstErrorStep) {
        setCurrentStep(firstErrorStep);
      }

      toast.error(`Please fix errors in step ${firstErrorStep}`);
      return;
    }

    try {
      const productInput = buildProductInput(formData, productId);
      await onSubmit(productInput);
      toast.success("Product created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    }
  };

  const renderStepContent = () => {
    const props = { formData, errors, updateFormData };
    switch (currentStep) {
      case 1:
        return <BasicDetailsStep {...props} categoriesData={categoriesData} />;
      case 2:
        return (
          <SpecificationsStep {...props} categoriesData={categoriesData} />
        );
      case 3:
        return <VariantsStep {...props} />; // NEW COMPONENT
      case 4:
        return <MediaStep {...props} />;
      case 5:
        return <ShippingStep {...props} />;
      case 6:
        return <ProductPreview formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* ... Header and ProgressStepper code remains same ... */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {mode === "edit" && onDelete && (
          <button
            className="px-3 py-2 bg-red-600 text-white rounded"
            onClick={() => {
              onDelete(productId);
            }}
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Progress</CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </div>
          </div>
        </CardHeader>
      </Card>

      <ProgressStepper steps={steps} currentStep={currentStep} />

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
          <CardDescription>
            {steps[currentStep - 1]?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      <FormNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrev={() => setCurrentStep((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentStep((p) => Math.min(steps.length, p + 1))}
        onSubmit={handleSubmit} // Define handleSubmit based on your logic
      />
    </div>
  );
}
