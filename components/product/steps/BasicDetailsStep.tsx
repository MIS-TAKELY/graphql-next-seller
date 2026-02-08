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
        // ... existing code

        const dummyBrands = [
            { id: "brand1", name: "Apple" },
            { id: "brand2", name: "Samsung" },
            { id: "brand3", name: "Nike" },
            { id: "brand4", name: "Adidas" },
            { id: "brand5", name: "Sony" },
        ];

        const handleCategoryChange = (value: string) => {
            updateFormData("categoryId", value);
            updateFormData("subcategory", ""); // Reset subcategory
            updateFormData("subSubcategory", ""); // Reset sub-subcategory
        };

        const handleSubcategoryChange = (value: string) => {
            updateFormData("subcategory", value);
            updateFormData("subSubcategory", ""); // Reset sub-subcategory
        };

        const [open, setOpen] = useState(false);
        const [inputValue, setInputValue] = useState(formData.brand || "");

        const handleSelect = (brand: string) => {
            setInputValue(brand);
            updateFormData("brand", brand);
            setOpen(false);
        };

        // Better handling of initial category values
        const getCategoryValue = () => {
            if (formData.categoryId) return formData.categoryId;
            if (formData.category?.parent?.parent?.id)
                return formData.category.parent.parent.id;
            if (formData.category?.parent?.id) return formData.category.parent.id;
            if (formData.category?.id && !formData.category?.parent)
                return formData.category.id;
            return "";
        };

        const getSubcategoryValue = () => {
            if (formData.subcategory) return formData.subcategory;
            if (formData.category?.parent?.id && formData.category?.parent?.parent) {
                return formData.category.parent.id;
            }
            if (
                formData.category?.id &&
                formData.category?.parent &&
                !formData.category?.parent?.parent
            ) {
                return formData.category.id;
            }
            return "";
        };

        const getSubSubcategoryValue = () => {
            if (formData.subSubcategory) return formData.subSubcategory;
            if (formData.category?.id && formData.category?.parent?.parent) {
                return formData.category.id;
            }
            return "";
        };

        // Get subcategories based on selected category
        const subcategories = useMemo(() => {
            const categoryId = getCategoryValue();
            if (!categoryId) return [];

            const category = categoriesData.find((cat) => cat.id === categoryId);
            return category?.children || [];
        }, [formData.categoryId, formData.category, categoriesData]);

        // Get sub-subcategories based on selected subcategory
        const subSubcategories = useMemo(() => {
            const subcategoryId = getSubcategoryValue();
            if (!subcategoryId) return [];

            const subcategory = subcategories.find((sub) => sub.id === subcategoryId);
            return subcategory?.children || [];
        }, [formData.subcategory, formData.category, subcategories]);

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Product Title" error={errors.name} required>
                        <div className="relative">
                            <ValidatedInput
                                placeholder="Enter product title"
                                value={formData.name || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    updateFormData("name", e.target.value);
                                }}
                                error={errors.name}
                            />
                            <div className={cn("text-xs text-right mt-1",
                                (formData.name?.length || 0) > 70 ? "text-red-500" : "text-muted-foreground"
                            )}>
                                {formData.name?.length || 0}/70 characters
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                No emojis. Special characters allowed.
                            </p>
                        </div>
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

                    {/* Brand field remains the same */}
                </div>

                {/* Three-level category selection */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Main Category */}
                        <FormField label="Main Category" error={errors.categoryId} required>
                            <ValidatedSelect
                                value={getCategoryValue()}
                                onValueChange={handleCategoryChange}
                                placeholder="Select main category"
                                error={errors.categoryId}
                            >
                                {categoriesData
                                    ?.filter((cat) => !cat.parentId)
                                    .map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                            </ValidatedSelect>
                        </FormField>

                        {/* Subcategory */}
                        <FormField label="Subcategory" error={errors.subcategory} required>
                            <ValidatedSelect
                                value={getSubcategoryValue()}
                                onValueChange={handleSubcategoryChange}
                                placeholder="Select subcategory"
                                error={errors.subcategory}
                                disabled={!getCategoryValue() || subcategories.length === 0}
                            >
                                {subcategories.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </SelectItem>
                                ))}
                            </ValidatedSelect>
                        </FormField>

                        {/* Sub-subcategory */}
                        <FormField
                            label="Product Type"
                            error={errors.subSubcategory}
                            required={subSubcategories.length > 0}
                        >
                            <ValidatedSelect
                                value={getSubSubcategoryValue()}
                                onValueChange={(value: string) =>
                                    updateFormData("subSubcategory", value)
                                }
                                placeholder="Select product type"
                                error={errors.subSubcategory}
                                disabled={
                                    !getSubcategoryValue() || subSubcategories.length === 0
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
                </div>

                <FormField
                    label="Product Description"
                    error={errors.description}
                    required
                >
                    <div className="relative">
                        <ValidatedTextarea
                            placeholder="Describe your product... (5-600 words)"
                            className="min-h-[120px]"
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                updateFormData("description", e.target.value)
                            }
                            error={errors.description}
                        />
                        <div className={cn("text-xs text-right mt-1",
                            (() => {
                                const count = formData.description?.trim().split(/\s+/).filter(Boolean).length || 0;
                                return (count < 5 || count > 600) ? "text-red-500" : "text-muted-foreground";
                            })()
                        )}>
                            {(formData.description?.trim().split(/\s+/).filter(Boolean).length || 0)} words (Min: 5, Max: 600)
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            No emojis.
                        </p>
                    </div>
                </FormField>
            </div>
        );
    }
);
