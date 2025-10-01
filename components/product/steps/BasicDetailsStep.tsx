import {
  FormField,
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "@/components/form-field";
import { SelectItem } from "@/components/ui/select";
import { Errors, FormData } from "@/types/pages/product";

// Assuming Category type based on schema (add to types if needed)
interface Category {
  id: string;
  name: string;
  children: Category[];
}

interface BasicDetailsStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
  categoriesData: Category[];
}

export const BasicDetailsStep = ({
  formData,
  errors,
  updateFormData,
  categoriesData,
}: BasicDetailsStepProps) => {

  // console.log("basic setup formdata-->",formData)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Product Title" error={errors.title} required>
          <ValidatedInput
            placeholder="Enter product title"
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateFormData("title", e.target.value)
            }
            error={errors.title}
          />
        </FormField>
        <FormField label="Brand" error={errors.brandId}>
          <ValidatedSelect
            value={formData.brandId}
            onValueChange={(value: string) => updateFormData("brandId", value)}
            placeholder="Select brand"
            error={errors.brandId}
          >
            {/* Brands are still hardcoded; to make dynamic, add a useQuery for brands similar to categories */}
            <SelectItem value="brand1">Brand 1</SelectItem>
            <SelectItem value="brand2">Brand 2</SelectItem>
          </ValidatedSelect>
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Category" error={errors.categoryId} required>
          <ValidatedSelect
            value={formData.categoryId}
            onValueChange={(value: string) =>
              updateFormData("categoryId", value)
            }
            placeholder="Select category"
            error={errors.categoryId}
          >
            {categoriesData.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </ValidatedSelect>
        </FormField>
        <FormField label="Subcategory" error={errors.subcategory} required>
          <ValidatedSelect
            value={formData.subcategory}
            onValueChange={(value: string) =>
              updateFormData("subcategory", value)
            }
            placeholder="Select subcategory"
            error={errors.subcategory}
            disabled={!formData.categoryId}
          >
            {formData.categoryId &&
              categoriesData
                .find((cat) => cat.id === formData.categoryId)
                ?.children.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
          </ValidatedSelect>
        </FormField>
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
};