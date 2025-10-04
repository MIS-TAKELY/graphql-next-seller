import {
  FormField,
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category.type";
import { FormData } from "@/types/pages/product";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useMemo, useState } from "react";

interface BasicDetailsStepProps {
  formData: FormData;
  errors: any;
  updateFormData: (field: keyof FormData, value: any) => void;
  categoriesData: Category[];
}

export const BasicDetailsStep = React.memo(
  ({
    formData,
    errors,
    updateFormData,
    categoriesData,
  }: BasicDetailsStepProps) => {
    const dummyBrands = [
      { id: "brand1", name: "Apple" },
      { id: "brand2", name: "Samsung" },
      { id: "brand3", name: "Nike" },
      { id: "brand4", name: "Adidas" },
      { id: "brand5", name: "Sony" },
    ];

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(formData.brand || "");

    const handleSelect = (brand: string) => {
      setInputValue(brand);
      updateFormData("brand", brand);
      setOpen(false);
    };

    // Get subcategories based on selected category
    const subcategories = useMemo(() => {
      if (
        !formData.categoryId &&
        (!formData?.category?.parent?.id || !formData?.category?.id)
      )
        return [];
      console.log("hello");
      const category = categoriesData.find(
        (cat) =>
          cat.id === formData.categoryId ||
          formData?.category?.parent.id ||
          formData?.category?.id
      );
      console.log("category", category);
      return category?.children || [];
    }, [formData.categoryId, categoriesData]);

    // Get sub-subcategories based on selected subcategory
    const subSubcategories = useMemo(() => {
      if (!formData.subcategory) return [];
      const subcategory = subcategories.find(
        (sub) => sub.id === formData.subcategory
      );
      return subcategory?.children || [];
    }, [formData.subcategory, subcategories]);

    // Reset dependent fields when parent selection changes
    const handleCategoryChange = (value: string) => {
      updateFormData("categoryId", value);
      updateFormData("subcategory", ""); // Reset subcategory
      updateFormData("subSubcategory", ""); // Reset sub-subcategory
    };

    const handleSubcategoryChange = (value: string) => {
      updateFormData("subcategory", value);
      updateFormData("subSubcategory", ""); // Reset sub-subcategory
    };

    console.log("form datat-->", formData.title);
    console.log("form datan-->", formData.name);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Product Title" error={errors.name} required>
            <ValidatedInput
              placeholder="Enter product title"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFormData("title", e.target.value)
              }
              error={errors.name}
            />
          </FormField>

          <FormField label="Brand" error={errors.brand}>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {inputValue || "Select or type brand"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search or type brand..."
                    value={inputValue}
                    onValueChange={(val) => {
                      setInputValue(val);
                      updateFormData("brand", val);
                    }}
                  />
                  <CommandEmpty>No brand found.</CommandEmpty>
                  <CommandGroup>
                    {dummyBrands?.map((b) => (
                      <CommandItem
                        key={b.id}
                        onSelect={() => handleSelect(b.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            inputValue === b.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {b.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </FormField>
        </div>

        {/* Three-level category selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Category */}
            <FormField label="Main Category" error={errors.categoryId} required>
              <ValidatedSelect
                value={
                  formData.categoryId ||
                  formData?.category?.parent?.parent?.id ||
                  formData?.category?.parent?.id
                }
                onValueChange={handleCategoryChange}
                placeholder="Select main category"
                error={errors.categoryId}
              >
                {categoriesData?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </ValidatedSelect>
            </FormField>

            {/* Subcategory */}
            <FormField label="Subcategory" error={errors.subcategory} required>
              <ValidatedSelect
                value={
                  formData.subcategory ||
                  formData?.category?.parent?.parent?.id ||
                  formData?.category?.parent?.id
                }
                onValueChange={handleSubcategoryChange}
                placeholder="Select subcategory"
                error={errors.subcategory}
                // disabled={!formData.categoryId || subcategories.length === 0}
              >
                {subcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </ValidatedSelect>
            </FormField>

            {/* Sub-subcategory (Third level) */}
            <FormField
              label="Product Type"
              error={errors.subSubcategory}
              required={subSubcategories.length > 0}
            >
              <ValidatedSelect
                value={formData.subSubcategory || formData?.category?.id}
                onValueChange={(value: string) =>
                  updateFormData("subSubcategory", value)
                }
                placeholder="Select product type"
                error={errors.subSubcategory}
                disabled={
                  !formData.subcategory || subSubcategories.length === 0
                }
              >
                {subSubcategories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </ValidatedSelect>
            </FormField>
          </div>

          {/* Display selected path for clarity */}
          {formData.categoryId ||
            (formData?.category?.id && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Selected category path:{" "}
                  <span className="font-medium text-foreground">
                    {
                      categoriesData.find((c) => c.id === formData.categoryId)
                        ?.name
                    }
                    {
                      categoriesData.find(
                        (c) => c.id === formData.category?.parent?.id
                      )?.name
                    }
                    {formData.subcategory &&
                      ` → ${
                        subcategories.find(
                          (s) =>
                            s.id === formData.category?.parent?.id ||
                            formData.category?.id
                        )?.name
                      }`}

                    {formData.subcategory &&
                      ` → ${
                        subcategories.find((s) => s.id === formData.subcategory)
                          ?.name
                      }`}
                    {formData.subSubcategory &&
                      ` → ${
                        subSubcategories.find(
                          (s) => s.id === formData.category?.id
                        )?.name
                      }`}

                    {formData.subSubcategory &&
                      ` → ${
                        subSubcategories.find(
                          (s) => s.id === formData.subSubcategory
                        )?.name
                      }`}
                  </span>
                </p>
              </div>
            ))}
        </div>

        <FormField
          label="Product Description"
          error={errors.description}
          required
        >
          <ValidatedTextarea
            placeholder="Describe your product..."
            className="min-h-[120px]"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateFormData("description", e.target.value)
            }
            error={errors.description}
          />
        </FormField>
      </div>
    );
  }
);

BasicDetailsStep.displayName = "BasicDetailsStep";
