"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FormNavigation } from "@/components/product/FormNavigation";
import { ProgressStepper } from "@/components/product/ProgressStepper";
import { BasicDetailsStep } from "@/components/product/steps/BasicDetailsStep";
import { MediaStep } from "@/components/product/steps/MediaStep";
import { PricingStep } from "@/components/product/steps/PricingStep";
import { ProductPreview } from "@/components/product/steps/ProductPreview";
import { ShippingStep } from "@/components/product/steps/ShippingStep";
import { SpecificationsStep } from "@/components/product/steps/SpecificationsStep";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Category } from "@/types/category.type";
import { FormData } from "@/types/pages/product";
import { buildProductInput, validateStep } from "@/utils/product/validateSteps";
import { useParams } from "next/navigation";

type Props = {
  mode: "add" | "edit";
  categoriesData: Category[];
  initialValues?: FormData; // when editing a product
  onSubmit: (input: any) => Promise<void>;
  onDelete?: (produtcId: string) => Promise<void>; // optional, only for edit
  isDeleting?: boolean;
  isSubmitting?: boolean;
  title: string;
  subtitle: string;
};

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Features and details" },
  { id: 3, title: "Pricing & Inventory", description: "Price and stock" },
  { id: 4, title: "Media Upload", description: "Images and videos" },
  { id: 5, title: "Shipping", description: "Delivery options" },
  { id: 6, title: "Policies / Preview", description: "Review & finalize" },
];

export function ProductForm({
  mode,
  categoriesData,
  initialValues,
  onSubmit,
  onDelete,
  isDeleting = false,
  isSubmitting = false,
  title,
  subtitle,
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  console.log("initialValues", initialValues);
  const [formData, setFormData] = useState<FormData>(
    initialValues || {
      name: "",
      description: "",
      categoryId: "",
      subcategory: "",
      brand: "",
      features: [],
      specifications: [],
      specificationDisplayFormat: "bullet",
      price: "",
      mrp: "",
      comparePrice: "",
      costPrice: "",
      sku: "",
      stock: "",
      trackQuantity: true,
      hasOffer: false,
      offerType: "PERCENTAGE",
      offerTitle: "",
      offerValue: "",
      offerStart: "",
      offerEnd: "",
      buyX: "",
      getY: "",
      productMedia: [],
      promotionalMedia: [],
      weight: "",
      length: "",
      width: "",
      height: "",
      isFragile: false,
      shippingMethod: "",
      carrier: "",
      estimatedDelivery: "",
      freeDeliveryOption: "none",
      freeDeliveryProvinces: [],
      noInternationalShipping: false,
      restrictedStates: [],
      returnType: "NO_RETURN",
      returnDuration: "",
      returnUnit: "days",
      returnConditions: "",
      returnPolicy: "",
      returnPeriod: "",

      warrantyType: "NO_WARRANTY",
      warrantyDuration: "",
      warrantyUnit: "months",
      warrantyDescription: "", // ✅ add this line
      warrantyConditions: "",
      warranty: "",
    }
  );

  const parama = useParams();
  const productId = parama.id as string;
  // console.log("parama--->",parama.id)

  const [errors, setErrors] = useState<any>({});
  const Categories = useMemo(() => categoriesData ?? [], [categoriesData]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep, formData, setErrors)) {
      setCurrentStep((s) => Math.min(s + 1, steps.length));
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    let isValid = true;
    for (let i = 1; i <= steps.length; i++) {
      if (!validateStep(i, formData, setErrors)) {
        isValid = false;
        break;
      }
    }

    console.log("isvalid", isValid);
    console.log(" steps.length", steps.length);
    if (!isValid) {
      toast.error("Please fix all errors before submission.");
      return;
    }
    try {
      console.log("form data--->", formData);
      if (!productId) throw new Error("Product id is not avilable");
      const productInput = buildProductInput(formData, productId);
      await onSubmit(productInput);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    }
  };

  const renderStepContent = () => {
    const stepProps = { formData, errors, updateFormData };
    switch (currentStep) {
      case 1:
        return <BasicDetailsStep {...stepProps} categoriesData={Categories} />;
      case 2:
        return (
          <SpecificationsStep {...stepProps} categoriesData={Categories} />
        );
      case 3:
        return <PricingStep {...stepProps} />;
      case 4:
        return <MediaStep {...stepProps} />;
      case 5:
        return <ShippingStep {...stepProps} />;
      case 6:
        return <ProductPreview formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
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
        onPrev={prevStep}
        onNext={nextStep}
        onSubmit={handleSubmit}
        // isSubmitting={isSubmitting}
      />
    </div>
  );
}
