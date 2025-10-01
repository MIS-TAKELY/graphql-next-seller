// components/steps/BasicDetailsStep.tsx
import { FormField, ValidatedTextarea } from "@/components/form-field";
import { Errors, FormData } from "@/types/pages/product";

interface PoliciesStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
}

export const PoliciesStep = ({
  formData,
  errors,
  updateFormData,
}: PoliciesStepProps) => {
  return (
    <div className="space-y-6">
      <FormField label="Return Policy">
        <ValidatedTextarea
          placeholder="Describe your return policy..."
          className="min-h-[120px]"
          value={formData.returnPolicy}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateFormData("returnPolicy", e.target.value)
          }
        />
      </FormField>
      <FormField label="Warranty Information">
        <ValidatedTextarea
          placeholder="Describe warranty terms..."
          className="min-h-[120px]"
          value={formData.warranty}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateFormData("warranty", e.target.value)
          }
        />
      </FormField>
    </div>
  );
};
