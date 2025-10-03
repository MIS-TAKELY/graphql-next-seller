"use client";

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
import { useProduct } from "@/hooks/product/useProduct";
import { Category } from "@/types/category.type";
import { FormData } from "@/types/pages/product";
import { buildProductInput, validateStep } from "@/utils/product/validateSteps";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Features and details" },
  { id: 3, title: "Pricing & Inventory", description: "Price and stock" },
  { id: 4, title: "Media Upload", description: "Images and videos" },
  { id: 5, title: "Shipping", description: "Delivery options" },
  { id: 6, title: "Preview", description: "Returns and warranty" },
];

export default function AddProductClient({
  categoriesData,
}: {
  categoriesData: Category[];
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<any>({});

  const { handleSubmitHandler } = useProduct();

  const [formData, setFormData] = useState<FormData>({
    // Basic Details
    title: "",
    description: "",
    categoryId: "",
    subcategory: "",
    brand: "",

    // Specifications
    features: [],
    specifications: [],
    specificationDisplayFormat: "bullet",

    // Pricing & Inventory
    salePrice: "",
    mrp: "",
    comparePrice: "",
    costPrice: "",
    sku: "",
    stock: "",
    trackQuantity: true,

    // Offers
    hasOffer: false,
    offerType: "PERCENTAGE",
    offerTitle: "",
    offerValue: "",
    offerStart: "",
    offerEnd: "",

    buyX: "",
    getY: "",

    // Media
    productMedia: [],
    promotionalMedia: [],

    // Shipping
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

    // Policies
    returnType: "NO_RETURN",
    returnDuration: "",
    returnUnit: "days",
    returnConditions: "",
    returnPolicy: "",
    returnPeriod: "",

    warrantyType: "NO_WARRANTY",
    warrantyDuration: "",
    warrantyUnit: "months",
    warrantyDescription: "",
    warrantyConditions: "",
    warrantyPeriod: "",
    warranty: "",
  });

  const Categories = useMemo(() => categoriesData ?? [], [categoriesData]);

  // console.log("categoriesData", Categories);

  // const updateFormData = useCallback(
  //   (field: keyof FormData, value: any) => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [field]: value,
  //     }));

  //     if (errors[field]) {
  //       setErrors((prev: any) => ({
  //         ...prev,
  //         [field]: undefined,
  //       }));
  //     }
  //   },
  //   [errors]
  // );

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep, formData, setErrors)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error("Please fix the errors before proceeding to the next step.");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    let isValid = true;
    for (let i = 1; i <= steps.length; i++) {
      if (!validateStep(i, formData, setErrors)) {
        isValid = false;
        break;
      }
    }
    if (!isValid) {
      toast.error("Please fix all errors before submitting the product.");
      return;
    }

    // setIsSubmitting(true);
    try {
      const productInput = buildProductInput(formData);
      // const productInput = buildProductInput(formData);

      // console.log("Product input:", productInput);

      handleSubmitHandler(productInput);
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(
        error.message || "Failed to create product. Please try again."
      );
    }
  };

  const renderStepContent = () => {
    const stepProps = { formData, errors, updateFormData };
    // const categoriesData = getCategoryData?.categories || [];

    // console.log("category data client side-->", Categories);

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
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product listing by following the steps below.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Product Creation Progress
              </CardTitle>
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
      />
    </div>
  );
}
