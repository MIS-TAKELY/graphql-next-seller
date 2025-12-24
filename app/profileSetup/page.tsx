"use client";

import { SETUP_SELLER_PROFILE } from "@/client/sellerProfile/sellerProfile.mutations";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import Stepper from "./Stepper";

type FormData = {
  shopName: string;
  slug: string;
  tagline: string;
  logo?: string;
  banner?: string;
  description?: string;

  businessName: string;
  businessRegNo?: string;
  businessType: string;
  phone: string;
  altPhone?: string;
  supportEmail?: string;

  addressLabel: string;
  fullName: string;
  addressPhone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;

  documents: {
    registration?: string;
    panVat: string;
    citizenshipFront?: string;
    citizenshipBack?: string;
  };

  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  confirmAccount?: string;
  branch?: string;
  mobileWallet?: string;
};

import siteLogo from "@/public/final_blue_logo_500by500.svg";
import siteLogoText from "@/public/final_blue_text_500by500.svg";
import { Check, AlertCircle } from "lucide-react";

const validationPatterns = {
  phone: /^[0-9]{10}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  panVat: /^[A-Z0-9]{9,15}$/,
  postalCode: /^[0-9]{5,6}$/,
  shopName: /^[a-zA-Z0-9\s&'-]{3,50}$/,
  personName: /^[a-zA-Z\s]{3,50}$/,
  businessName: /^[a-zA-Z0-9\s&'.-]{3,100}$/,
};

const NEPAL_PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

export default function SellerOnboarding() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const router = useRouter();
  const [setupSellerProfile, { loading }] = useMutation(SETUP_SELLER_PROFILE);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      businessType: "Individual / Sole Proprietor",
      documents: {
        registration: "",
        panVat: "",
        citizenshipFront: "",
        citizenshipBack: "",
      },
    },
  });

  const shopName = watch("shopName") || "";
  const slug = shopName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const nextStep = async () => {
    let fields: (keyof FormData)[] = [];
    switch (step) {
      case 2:
        fields = ["shopName", "tagline"];
        break;
      case 3:
        fields = ["businessName", "businessRegNo", "phone", "supportEmail"];
        break;
      case 4:
        fields = ["addressLabel", "fullName", "addressPhone", "line1", "city", "state", "postalCode"];
        break;
      // case 6:
      //   fields = [
      //     "bankName",
      //     "accountHolder",
      //     "accountNumber",
      //     "confirmAccount",
      //   ];
      //   break;
    }
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (valid) setStep((s) => Math.min(s + 1, totalSteps));
    } else {
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: FormData) => {
    try {
      const addressInput = {
        label: data.addressLabel || data.shopName,
        line1: data.line1,
        line2: data.line2 || "",
        city: data.city,
        state: data.state,
        country: "NP",
        postalCode: data.postalCode,
        phone: data.addressPhone || data.phone,
      };

      const result = await setupSellerProfile({
        variables: {
          input: {
            shopName: data.shopName,
            slug,
            tagline: data.tagline || "",
            description: data.description || "",
            logo: data.logo,
            banner: data.banner || "",
            businessName: data.businessName,
            businessRegNo: data.businessRegNo,
            businessType: data.businessType,
            phone: data.phone,
            altPhone: data.altPhone || "",
            supportEmail: data.supportEmail || "",
            address: addressInput,
          },
        },
      });

      if (result.data) {
        toast.success("Shop created successfully! Redirecting to dashboard...");
        // Force cache revalidation
        router.refresh();
        // Small delay to ensure cache is updated
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    } catch (error: unknown) {
      console.error("Profile setup error:", error);

      // Extract meaningful error message
      let errorMessage = "Something went wrong during profile setup. Please try again.";

      // Type-safe error handling
      if (error && typeof error === 'object') {
        const gqlError = error as { graphQLErrors?: { message: string }[]; networkError?: { name?: string }; message?: string };

        // GraphQL Errors
        if (gqlError.graphQLErrors && gqlError.graphQLErrors.length > 0) {
          errorMessage = gqlError.graphQLErrors[0].message;
        }
        // Network/Parsing Errors (like the HTML response issue)
        else if (gqlError.networkError) {
          console.error("Network error details:", gqlError.networkError);
          errorMessage = "Unable to connect to the server. Please check your connection or try again later.";

          // Handle specific server parse error (HTML instead of JSON)
          if (gqlError.networkError.name === "ServerParseError") {
            errorMessage = "Server configuration error. Please contact support.";
          }
        }
        // Other Apollo/System Errors
        else if (gqlError.message && !gqlError.message.includes("Unexpected token")) {
          errorMessage = gqlError.message;
        }
      }

      // Check for common business logic errors and provide friendly messages
      if (errorMessage.toLowerCase().includes("already exists")) {
        toast.error("A seller profile already exists for this account.");
      } else if (errorMessage.toLowerCase().includes("slug") || errorMessage.toLowerCase().includes("shop name")) {
        toast.error("This shop name or URL is already taken. Please try a different one.");
      } else {
        // Generic fallback for system errors to avoid exposing internal details
        toast.error(errorMessage);
      }
    }
  };

  // Helper function to determine input styling based on error state
  const getInputClassName = (fieldName: keyof FormData | string) => {
    const hasError = fieldName.includes('.')
      ? fieldName.split('.').reduce((obj: Record<string, any> | undefined, key) => obj?.[key], errors)
      : errors[fieldName as keyof FormData];

    return `w-full px-4 py-3 border rounded-lg transition-all duration-200 ${hasError
      ? 'border-destructive focus:ring-2 focus:ring-destructive/20 focus:border-destructive bg-destructive/5'
      : 'border-input bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-muted-foreground/30'
      }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {step === 1 ? "Welcome! Start Selling Today" : "Set Up Your Shop"}
          </h1>
          {step > 1 && (
            <div className="mt-6">
              <Stepper currentStep={step} totalSteps={totalSteps} />
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="text-center py-16 relative">
                {/* Background Faded Logo (Centered) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Image
                    src={siteLogo}
                    alt="Background logo"
                    width={320}
                    height={320}
                    className="opacity-5 select-none"
                    priority
                  />
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <Image
                      src={siteLogoText}
                      alt="YourSite"
                      width={128}
                      height={90}
                      className="select-none"
                      priority
                    />
                  </div>

                  <h2 className="text-2xl font-semibold text-foreground mb-8">
                    Reach Thousands of Customers
                  </h2>

                  <ul className="max-w-md mx-auto text-left space-y-4 mb-12 text-muted-foreground text-base">
                    <li className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Zero setup fee
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      List products in minutes
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Fast weekly payouts
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Dedicated support team
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-blue-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Selling Now
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shop Info */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground pb-4 border-b border-border">
                  Shop Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("shopName", {
                      required: "Shop name is required",
                      pattern: {
                        value: validationPatterns.shopName,
                        message: "Shop name must be 3-50 characters and contain only letters, numbers, spaces, &, ', -"
                      }
                    })}
                    className={getInputClassName("shopName")}
                    placeholder="e.g. TechMart Nepal"
                  />
                  {errors.shopName && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.shopName.message}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Shop URL
                  </label>
                  <div className="flex border border-input rounded-lg overflow-hidden bg-muted/30">
                    <span className="inline-flex items-center px-4 py-3 bg-muted text-muted-foreground border-r border-input">
                      vanijoy.com/shop/
                    </span>
                    <input
                      value={slug || "(enter shop name)"}
                      readOnly
                      className="flex-1 px-4 py-3 bg-muted/20 text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Controller
                    control={control}
                    name="logo"
                    render={({ field }) => (
                      <ImageUpload
                        label="Shop Logo (Recommended)"
                        recommended="300×300px recommended"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  {/* <Controller
                    control={control}
                    name="banner"
                    render={({ field }) => (
                      <ImageUpload
                        label="Shop Banner (Optional)"
                        recommended="1200×300px recommended"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  /> */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Short Tagline <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("tagline", {
                      required: "Tagline is required",
                      minLength: { value: 5, message: "Tagline must be at least 5 characters" },
                      maxLength: { value: 100, message: "Tagline must not exceed 100 characters" }
                    })}
                    placeholder="e.g. Best Deals in Electronics!"
                    className={getInputClassName("tagline")}
                  />
                  {errors.tagline && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.tagline.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Business Details */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground pb-4 border-b border-border">
                  Business Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Legal Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("businessName", {
                      required: "Business name is required",
                      pattern: {
                        value: validationPatterns.businessName,
                        message: "Business name must be 3-100 characters"
                      }
                    })}
                    className={getInputClassName("businessName")}
                    placeholder="Your registered business name"
                  />
                  {errors.businessName && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.businessName.message}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    PAN / VAT Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("businessRegNo", {
                      required: "PAN/VAT number is required",
                      pattern: {
                        value: validationPatterns.panVat,
                        message: "Invalid PAN/VAT format (9-15 alphanumeric characters)"
                      }
                    })}
                    className={getInputClassName("businessRegNo")}
                    placeholder="Enter PAN or VAT number"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.businessRegNo && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.businessRegNo.message}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Type
                  </label>
                  <select
                    {...register("businessType")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>Individual / Sole Proprietor</option>
                    <option>Partnership</option>
                    <option>Private Limited</option>
                    <option>Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: validationPatterns.phone,
                        message: "Phone number must be exactly 10 digits"
                      }
                    })}
                    type="tel"
                    className={getInputClassName("phone")}
                    placeholder="10-digit phone number"
                  />
                  {errors.phone && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.phone.message}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Support Email
                  </label>
                  <input
                    {...register("supportEmail", {
                      pattern: {
                        value: validationPatterns.email,
                        message: "Please enter a valid email address"
                      }
                    })}
                    type="email"
                    className={getInputClassName("supportEmail")}
                    placeholder="support@yourshop.com"
                  />
                  {errors.supportEmail && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.supportEmail.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Address */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground pb-4 border-b border-border">
                  Pickup / Warehouse Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Location Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("addressLabel", {
                        required: "Location name is required"
                      })}
                      placeholder="e.g. Main Warehouse"
                      className={getInputClassName("addressLabel")}
                    />
                    {errors.addressLabel && (
                      <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.addressLabel.message}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("fullName", {
                        required: "Contact person name is required",
                        pattern: {
                          value: validationPatterns.personName,
                          message: "Name must contain only letters and spaces"
                        }
                      })}
                      placeholder="Full name"
                      className={getInputClassName("fullName")}
                    />
                    {errors.fullName && (
                      <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.fullName.message}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("addressPhone", {
                        required: "Phone number is required",
                        pattern: {
                          value: validationPatterns.phone,
                          message: "Phone number must be exactly 10 digits"
                        }
                      })}
                      placeholder="10-digit phone number"
                      className={getInputClassName("addressPhone")}
                    />
                    {errors.addressPhone && (
                      <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.addressPhone.message}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("line1", {
                        required: "Address is required",
                        minLength: { value: 5, message: "Address too short" }
                      })}
                      placeholder="Street address"
                      className={getInputClassName("line1")}
                    />
                    {errors.line1 && (
                      <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.line1.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      {...register("line2")}
                      placeholder="Apartment, suite, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("city", {
                        required: "City is required",
                        minLength: { value: 2, message: "City name too short" }
                      })}
                      placeholder="City name"
                      className={getInputClassName("city")}
                    />
                    {errors.city && (
                      <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.city.message}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("state", {
                        required: "Province is required"
                      })}
                      className={getInputClassName("state")}
                    >
                      <option value="">Select Province</option>
                      {NEPAL_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.state.message}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("postalCode", {
                        required: "Postal code is required",
                        pattern: {
                          value: validationPatterns.postalCode,
                          message: "Postal code must be 5-6 digits"
                        }
                      })}
                      placeholder="5 or 6 digit postal code"
                      className={getInputClassName("postalCode")}
                    />
                    {errors.postalCode && (
                      <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.postalCode.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {/* {step === 5 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-5">
                  Upload Documents (KYC)
                </h3>
                <div className="space-y-7">
                  {(
                    [
                      {
                        key: "registration",
                        label: "Business Registration Certificate *",
                      },
                      { key: "panVat", label: "PAN / VAT Certificate *" },
                      { key: "citizenshipFront", label: "Citizenship Front *" },
                      {
                        key: "citizenshipBack",
                        label: "Citizenship Back (Optional)",
                      },
                    ] as const
                  ).map(({ key, label }) => (
                    <Controller
                      key={key}
                      control={control}
                      name={`documents.${key}` as any}
                      render={({ field }) => (
                        <ImageUpload
                          label={label}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  ))}
                </div>
              </div>
            )} */}

            {/* Step 6: Bank Details */}
            {/* {step === 6 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-5">
                  Bank Account for Payouts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    {...register("bankName", { required: true })}
                    placeholder="Bank Name *"
                    className="px-4 py-3 border border-gray-300 rounded-md"
                  />
                  <input
                    {...register("accountHolder", { required: true })}
                    placeholder="Account Holder Name *"
                    className="px-4 py-3 border border-gray-300 rounded-md"
                  />
                  <input
                    {...register("accountNumber", { required: true })}
                    placeholder="Account Number *"
                    className="px-4 py-3 border border-gray-300 rounded-md"
                  />
                  <input
                    {...register("confirmAccount", { required: true })}
                    placeholder="Confirm Account Number *"
                    className="px-4 py-3 border border-gray-300 rounded-md"
                  />
                  <input
                    {...register("branch")}
                    placeholder="Branch Name (Optional)"
                    className="px-4 py-3 border border-gray-300 rounded-md md:col-span-2"
                  />
                </div>
              </div>
            )} */}

            {/* Step 7: Review & Submit */}
            {step === 5 && (
              <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Review & Submit</h2>
                <p className="text-muted-foreground mb-8">
                  Your shop will go live after approval (usually within 24 hours)
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-6 rounded-xl text-left max-w-lg mx-auto mb-8 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-foreground mb-4">Shop Summary</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Shop Name:</span>
                      <strong className="text-foreground">{watch("shopName") || "—"}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Business Name:</span>
                      <strong className="text-foreground">{watch("businessName") || "—"}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <strong className="text-foreground">{watch("phone") || "—"}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">City:</span>
                      <strong className="text-foreground">{watch("city") || "—"}</strong>
                    </p>
                  </div>
                </div>

                <label className="flex items-center justify-center gap-3 mb-8 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-background border-input"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground">
                    I agree to the Terms & Conditions and Commission Policy
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-12 py-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-60 transition-all transform hover:scale-105 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit for Approval"
                  )}
                </button>
              </div>
            )}

            {/* Navigation */}
            {step > 1 && step < 5 && (
              <div className="flex justify-between pt-8 border-t border-border">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-input rounded-lg font-medium hover:bg-muted transition-colors text-foreground"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md"
                >
                  Continue →
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}