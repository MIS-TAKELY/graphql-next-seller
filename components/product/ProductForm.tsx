// components/product/ProductForm.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { FormNavigation } from "@/components/product/FormNavigation";
import { BasicDetailsStep } from "@/components/product/steps/BasicDetailsStep";
import { MediaStep } from "@/components/product/steps/MediaStep";
import { ProductPreview } from "@/components/product/steps/ProductPreview";
import { ShippingStep } from "@/components/product/steps/ShippingStep";
import { SpecificationsStep } from "@/components/product/steps/SpecificationsStep";
import { VariantsStep } from "@/components/product/steps/VariantsStep";

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
import { FullScreenLoader } from "./FullScreenLoader";
import { ProgressStepper } from "./ProgressStepper";
import { Category } from "@/types/category/category.types";
import { ICreateProductInput } from "@/types/product/product-api.types";

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Technical details" },
  { id: 3, title: "Variants & Pricing", description: "Price, Stock & Options" },
  { id: 4, title: "Media", description: "Images and videos" },
  { id: 5, title: "Shipping & Policies", description: "Delivery & Warranty" },
  { id: 6, title: "Preview", description: "Review & finalize" },
];

const LOADING_STEPS = [
  "Validating product details...",
  "Processing images and media...",
  "Creating product variants...",
  "Setting up pricing and offers...",
  "Configuring shipping options...",
  "Finalizing product creation...",
];

interface Props {
  mode: "create" | "edit" | "add";
  categoriesData?: Category[];
  initialValues?: FormData;
  onSubmit: (input: ICreateProductInput, status: ProductStatus) => Promise<void>;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
  isSubmitting?: boolean;
  title?: string;
  subtitle?: string;
}

export function ProductForm({
  mode = "add",
  categoriesData = [],
  initialValues,
  onSubmit,
  onDelete,
  isDeleting,
  isSubmitting: externalIsSubmitting,
  title = "Add Product",
  subtitle = "Fill in the details to create a new product",
}: Props) {
  const params = useParams();
  const productId = params.id as string | undefined;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>(
    initialValues || {
      name: "",
      description: "",
      categoryId: "",
      subcategory: "",
      subSubcategory: "",
      brand: "",
      status: ProductStatus.DRAFT,

      specifications: [],
      specificationDisplayFormat: "bullet" as const,

      hasVariants: false,
      attributes: [],
      variants: [],
      price: "",
      mrp: "",
      sku: "",
      stock: 0,

      productMedia: [],
      promotionalMedia: [],

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

      returnType: ReturnType.NO_RETURN,
      returnDuration: "",
      returnUnit: "days",
      returnConditions: "",

      warrantyType: WarrantyType.NO_WARRANTY,
      warrantyDuration: "",
      warrantyUnit: "months",
      warrantyDescription: "",

      hasOffer: false,
      offerType: DiscountType.PERCENTAGE,
      offerTitle: "",
      offerValue: "",
      offerStart: "",
      offerEnd: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pendingSubmitStatus, setPendingSubmitStatus] = useState<ProductStatus | null>(null);

  // Effect to handle auto-submission when uploads complete
  useEffect(() => {
    if (pendingSubmitStatus) {
      const hasPendingMedia = [...formData.productMedia, ...formData.promotionalMedia].some(
        (media) => media.url.startsWith("blob:") || media.pending
      );

      if (!hasPendingMedia) {
        // All uploads finished, proceed to submit
        const status = pendingSubmitStatus;
        setPendingSubmitStatus(null);
        handleSubmit(status);
      }
    }
  }, [formData.productMedia, formData.promotionalMedia, pendingSubmitStatus]);

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K] | ((prev: FormData[K]) => FormData[K])
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "function"
        ? (value as (prev: FormData[K]) => FormData[K])(prev[field])
        : value,
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Navigate to next step with validation
  const nextStep = () => {
    const isValid = validateStep(currentStep, formData, setErrors);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Validate all steps before submission
  const validateAllSteps = (): boolean => {
    const allErrors: Record<string, string> = {};
    let firstInvalidStep: number | null = null;

    // Validate all steps except the preview step
    for (let step = 1; step < steps.length; step++) {
      const stepErrors: Record<string, string> = {};
      const isValid = validateStep(step, formData, (err) => {
        Object.assign(stepErrors, err);
      });

      if (!isValid) {
        Object.assign(allErrors, stepErrors);
        if (firstInvalidStep === null) {
          firstInvalidStep = step;
        }
      }
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (firstInvalidStep) {
        setCurrentStep(firstInvalidStep);
        toast.error(
          `Please fix errors in step ${firstInvalidStep}: ${steps[firstInvalidStep - 1].title
          }`
        );
      }
      return false;
    }

    return true;
  };

  // Handle form submission (Draft or Publish)
  const handleSubmit = async (status: ProductStatus) => {
    // Validate all steps first
    if (!validateAllSteps()) {
      setPendingSubmitStatus(null); // Reset if validation fails
      return;
    }

    // Check for pending uploads
    const hasPendingMedia = [...formData.productMedia, ...formData.promotionalMedia].some(
      (media) => media.url.startsWith("blob:") || media.pending
    );

    if (hasPendingMedia) {
      if (!pendingSubmitStatus) {
        setPendingSubmitStatus(status);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const input = buildProductInput(formData, productId);

      console.log("input before change-->", input.status);
      // input.status=ProductStatus.INACTIVE

      status === ProductStatus.ACTIVE
        ? (input.status = ProductStatus.ACTIVE)
        : (input.status = ProductStatus.DRAFT);

      console.log("input after change-->", input)
      await onSubmit(input, status);

      await onSubmit(input, status);

    } catch (err: unknown) {
      console.error("Submit error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const props = { formData, errors, updateFormData };

    switch (currentStep) {
      case 1:
        return <BasicDetailsStep {...props} categoriesData={categoriesData} />;
      case 2:
        return <SpecificationsStep {...props} />;
      case 3:
        return <VariantsStep {...props} />;
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

  const loadingState = isSubmitting || externalIsSubmitting || !!pendingSubmitStatus || false;

  return (
    <>
      <FullScreenLoader
        isLoading={loadingState}
        message={
          !!pendingSubmitStatus
            ? "Finishing uploads..."
            : mode === "edit"
              ? "Updating your product..."
              : "Creating your product..."
        }
        showProgress={true}
        steps={LOADING_STEPS}
      />

      <div className="flex-1 space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {mode === "edit" && onDelete && (
            <button
              onClick={() => onDelete()}
              disabled={isDeleting || loadingState}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </button>
          )}
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Progress</CardTitle>
                <CardDescription>
                  Step {currentStep} of {steps.length}
                </CardDescription>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Stepper */}
        <ProgressStepper steps={steps} currentStep={currentStep} />

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrev={prevStep}
          onNext={nextStep}
          onSaveDraft={
            currentStep === steps.length
              ? () => handleSubmit(ProductStatus.DRAFT)
              : undefined
          }
          onPublish={
            currentStep === steps.length
              ? () => handleSubmit(ProductStatus.ACTIVE)
              : undefined
          }
          isLoading={loadingState}
          submitLabel={mode === "edit" ? "Update Product" : "Publish Product"}
        />
      </div>
    </>
  );
}
